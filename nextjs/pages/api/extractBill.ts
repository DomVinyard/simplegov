import client from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { NextApiRequest, NextApiResponse } from "next";
import request from "request-promise";
import pdfParse from "pdf-parse";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id, shortTitle } = req.body.event.data.new;
    const publicationEndpoint = `https://bills-api.parliament.uk/api/v1/Bills/${id}/Publications`;
    const governmentRes = await fetch(publicationEndpoint, {
      headers: { "Content-Type": "application/pdf" },
    });
    const { publications } = await governmentRes.json();
    const publication_url = publications.filter(
      (pub: any) => pub.publicationType.name === "Bill"
    )?.[0]?.links?.[0]?.url;
    if (!publication_url) throw new Error("No publication found");
    const pdf = await request(
      `https://app.scrapingbee.com/api/v1/?api_key=${process.env.SCRAPER_API_KEY}&url=${publication_url}&premium_proxy=True&render_js=False`,
      { encoding: null, timeout: 30000 }
    );
    const { text: rawText } = await pdfParse(pdf);
    await client.mutate({
      mutation: gql`
        mutation UPDATE_BILL(
          $id: String!
          $rawText: String!
          $documentLink: String!
        ) {
          update_bills_by_pk(
            pk_columns: { id: $id }
            _set: { rawText: $rawText, documentLink: $documentLink }
          ) {
            id
          }
        }
      `,
      variables: { id, rawText, documentLink: publication_url },
    });
    console.log(`Extracted bill ${id}/${shortTitle} (${rawText.length} chars)`);
    res.send(200);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
}
