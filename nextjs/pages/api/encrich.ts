import client from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { NextApiRequest, NextApiResponse } from "next";

// Run every minute

const attemptExtract = async () => {
  // try and extract something unextracted
};

const attemptSummary = async () => {
  // try and generate summaries for something without a summary
};

const attemptArgument = async () => {
  // try and generate arguments for something without arguments
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await attemptExtract();
  await attemptSummary();
  await attemptArgument();
  res.send(200);
}
