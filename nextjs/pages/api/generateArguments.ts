import client from "@/lib/apollo-client";
import runGPTQuery from "@/lib/gpt-query";
import { gql } from "@apollo/client";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";

// Run every minute

const deleteExistingArguments = async (billID: string) => {
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
};

const generateArgs = async (billID: string) => {
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
      `Your are somebody who is interested in politics and you have been asked to debate uk legislation.` +
      `You can see the arguments for and against the bill below.` +
      `This is the bill we will be discussing:
              
          ${rawText.slice(0, CHAR_LIMIT)}
        `,

    query:
      `Take this bill and find three arguments for it and three arguments against it.` +
      `Use the sort of language that a 10 year old would understand and structure your response as json in the following format. 
      {
        for: ['argument 1', 'argument 2', 'argument 3']
        against: ['argument 1', 'argument 2', 'argument 3']
      }`,
  });
  // console.log(billArguments);
  const argsAsJSON = JSON.parse(`${billArguments}`);
  const argsProcessed = [
    ...argsAsJSON.for.map((arg: string) => ({
      id: uuidv4(),
      billID,
      position: "for",
      argument: arg,
    })),
    ...argsAsJSON.against.map((arg: string) => ({
      id: uuidv4(),
      billID,
      position: "against",
      argument: arg,
    })),
  ];
  const argumentResponses = await Promise.all(
    argsProcessed.map(async (arg) => {
      const argument = await runGPTQuery({
        system:
          `Your are somebody who is interested in politics and you have been asked to debate uk legislation.` +
          `This is the bill we will be discussing:
              
              ${rawText.slice(0, CHAR_LIMIT)}
              `,
        query:
          `
            You think that this bill is a ${
              arg.position === "for" ? "bad" : "good"
            } thing. You are arguing against somebody who thinks that ${
            arg.argument
          }.` +
          ` Present a counter argument in 50 words or less.
            `,
      });
      return {
        parentID: arg.id,
        billID,
        position: arg.position === "for" ? "against" : "for",
        argument,
      };
    })
  );

  const allArguments = [...argsProcessed, ...argumentResponses].filter(
    (argument) => {
      return (
        !argument.argument.toLowerCase().startsWith("i'm sorry") ||
        !argument.argument.toLowerCase().startsWith("sorry") ||
        !argument.argument.toLowerCase().includes("language model") ||
        !argument.argument.toLowerCase().includes("openai")
      );
    }
  );
  await deleteExistingArguments(billID);
  await client.mutate({
    mutation: gql`
      mutation ($arguments: [arguments_insert_input!]!) {
        insert_arguments(objects: $arguments) {
          affected_rows
        }
      }
    `,
    variables: {
      arguments: allArguments,
    },
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { billID } = body.event.data.new;
    const MAX_TRIES = 3;
    let triesCounter = 0;
    while (triesCounter < MAX_TRIES) {
      console.log(`try #${triesCounter}`);
      try {
        await generateArgs(billID);
        await res.revalidate(`/`);
        await res.revalidate(`/bill/${billID}`);
        res.send(200);
        break; // 'return' would work here as well
      } catch (err) {
        console.log(err);
        return res.status(500).send(err);
      }
      triesCounter++;
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
}

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };
