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
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { billID } = body.event.data.new;
    console.log({ billID });
    // delete existing
    await client.mutate({
      mutation: gql`
        mutation ($billID: String!) {
          delete_arguments(where: { billID: { _eq: $billID } }) {
            affected_rows
          }
        }
      `,
      variables: {
        billID,
      },
    });
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
    const billArguments = await runGPTQuery({
      system:
        `You are a helpful researcher who wants to help people to understand a piece of uk legislation.` +
        `Your job is to take a bill and provide arguments for and against its implementation.`,
      query: `Take a bill and find three arguments for it and three arguments against it, structure your response as json in the following format:

      {
        for: ['argument 1', 'argument 2', 'argument 3']
        against: ['argument 1', 'argument 2', 'argument 3']
      }

      This is the bill:
      
      ${rawText.slice(0, CHAR_LIMIT)}`,
    });

    const argsAsJSON = JSON.parse(`${billArguments}`);
    const argsProcessed = [
      ...argsAsJSON.for.map((arg: string) => ({
        billID,
        position: "for",
        argument: arg,
      })),
      ...argsAsJSON.against.map((arg: string) => ({
        billID,
        position: "against",
        argument: arg,
      })),
    ];
    await client.mutate({
      mutation: gql`
        mutation ($arguments: [arguments_insert_input!]!) {
          insert_arguments(objects: $arguments) {
            affected_rows
          }
        }
      `,
      variables: {
        arguments: argsProcessed,
      },
    });

    console.log(billArguments);
    res.send(200);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
}

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };
