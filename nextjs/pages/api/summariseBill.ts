import client from "@/lib/apollo-client";
import runGPTQuery from "@/lib/gpt-query";
import { gql } from "@apollo/client";
import { NextApiRequest, NextApiResponse } from "next";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { id: billID } = body.event.data.new;

    const {
      data: {
        bill: { rawText },
      },
    } = await client.query({
      query: gql`
        query GET_BILL($billID: String!) {
          bill: bills_by_pk(id: $billID) {
            id
            rawText
          }
        }
      `,
      variables: { billID },
    });

    const CHAR_LIMIT = 12000;
    const simplifiedLong = await runGPTQuery({
      system:
        `You are a helpful researcher who wants to help people to understand a piece of uk legislation.` +
        `You never use political or technical words when simple ones are available.`,
      query: `I am a 10 year old. Using no more than 150 words, please describe the following bill using language that i would understand: \n\n${rawText.slice(
        0,
        CHAR_LIMIT
      )}`,
    });

    const simplifiedLongHighlighted = await runGPTQuery({
      system: `Your job is to annotate a piece of text. 
      You will return the same text you received with the annotations included.`,
      query: `Take the following piece of text, identify up to three 
      key concepts and return the exact same block of text with the identified
      concepts wrapped in <strong> tags: \n\n${simplifiedLong})`,
    });
    if (!simplifiedLong) throw new Error("No summary found");
    const simplifiedShort = await runGPTQuery({
      system:
        `You are a helpful researcher who wants to help people to understand a piece of uk legislation.` +
        `You never use political or technical words when simple ones are available.` +
        `Make your reply less than 10 words`,
      query: `Please describe the following bill in 10 words or less. Use tabloid style language but do not use exclamation mark: \n\n${rawText.slice(
        0,
        CHAR_LIMIT
      )}`,
    });
    await client.mutate({
      mutation: gql`
        mutation INSERT_DESCRIPTION(
          $billID: String!
          $simplifiedLong: String!
          $simplifiedShort: String!
        ) {
          insert_descriptions(
            objects: {
              billID: $billID
              simplifiedShort: $simplifiedShort
              simplifiedLong: $simplifiedLong
            }
            on_conflict: {
              constraint: descriptions_billID2_key
              update_columns: [simplifiedLong, simplifiedShort]
            }
          ) {
            returning {
              id
            }
          }
        }
      `,
      variables: {
        billID,
        simplifiedLong: simplifiedLongHighlighted,
        simplifiedShort,
      },
    });
    await res.revalidate(`/`);
    await res.revalidate(`/bill/${billID}`);
    res.send(200);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
}

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };
