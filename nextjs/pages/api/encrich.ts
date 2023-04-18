import client from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { NextApiRequest, NextApiResponse } from "next";

// Run every 10 minutes

const makeAttempt = async () => {
  // pick a random item and regenerate it
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await makeAttempt();
  res.send(200);
}
