import client from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { NextApiRequest, NextApiResponse } from "next";
import request from "request-promise";
import pdfParse from "pdf-parse";

// TODO: run this if lastupdated changes

const setNoText = async (id: string) => {
  await client.mutate({
    mutation: gql`
      mutation UPDATE_BILL($id: String!) {
        update_bills_by_pk(
          pk_columns: { id: $id }
          _set: { documentLink: "NONE" }
        ) {
          id
        }
      }
    `,
    variables: {
      id,
    },
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { id, shortTitle } = body.event.data.new;
    const billEndpoint = `https://bills-api.parliament.uk/api/v1/Bills/${id}`;
    const publicationEndpoint = `https://bills-api.parliament.uk/api/v1/Bills/${id}/Publications`;
    const billRes = await fetch(billEndpoint, {
      headers: { "Content-Type": "application/pdf" },
    });
    const publicationRes = await fetch(publicationEndpoint, {
      headers: { "Content-Type": "application/pdf" },
    });
    const govData = await billRes.json();
    const { publications } = await publicationRes.json();
    const publication_url = publications?.filter(
      (pub: any) => pub.publicationType.name === "Bill"
    )?.[0]?.links?.[0]?.url;
    if (!publication_url) {
      await setNoText(id);
      await res.revalidate(`/`);
      throw new Error("No publication found");
    }
    const pdf = await request(
      `https://app.scrapingbee.com/api/v1/?api_key=${process.env.SCRAPER_API_KEY}&url=${publication_url}&premium_proxy=True&render_js=False`,
      { encoding: null, timeout: 30000 }
    );
    const parsed = await pdfParse(pdf);
    const rawText = parsed?.text;
    if (!rawText) {
      await setNoText(id);
      await res.revalidate(`/`);
      throw new Error("No text extracted from publication");
    }
    await client.mutate({
      mutation: gql`
        mutation UPDATE_BILL(
          $id: String!
          $rawText: String!
          $documentLink: String!
          $govData: jsonb
        ) {
          update_bills_by_pk(
            pk_columns: { id: $id }
            _set: {
              rawText: $rawText
              documentLink: $documentLink
              govData: $govData
            }
          ) {
            id
          }
        }
      `,
      variables: {
        id,
        rawText,
        documentLink: publication_url,
        govData: govData,
      },
    });
    console.log(`Extracted bill ${id}/${shortTitle} (${rawText.length} chars)`);
    await res.revalidate(`/`);
    await res.revalidate(`/bill/${id}`);
    res.send(200);
  } catch (err) {
    console.error(err);
    await res.revalidate(`/`);
    return res.status(500).send(err);
  }
}
