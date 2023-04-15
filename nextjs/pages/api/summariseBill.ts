import client from "@/lib/apollo-client";
import runGPTQuery from "@/lib/gpt-query";
import { gql } from "@apollo/client";
import { NextApiRequest, NextApiResponse } from "next";

// Run every minute

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id: billID, rawText } = req.body.event.data.new;

    const CHAR_LIMIT = 12000;
    const simplifiedLong = await runGPTQuery({
      system:
        `You are a helpful assistant who wants to help people to understand a piece of uk legislation.` +
        `You never use political or technical words when simple ones are available.`,
      query: `I am a ten year old. Please describe the following bill in words that I can understand: \n\n${rawText.slice(
        0,
        CHAR_LIMIT
      )}`,
    });
    if (!simplifiedLong) throw new Error("No summary found");
    await client.mutate({
      mutation: gql`
        mutation INSERT_DESCRIPTION(
          $billID: String!
          $simplifiedLong: String!
        ) {
          insert_descriptions(
            objects: { billID: $billID, simplifiedLong: $simplifiedLong }
            on_conflict: {
              constraint: descriptions_billID_key
              update_columns: [simplifiedLong]
            }
          ) {
            returning {
              id
            }
          }
        }
      `,
      variables: { billID, simplifiedLong },
    });
    res.send(200);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
}

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };
