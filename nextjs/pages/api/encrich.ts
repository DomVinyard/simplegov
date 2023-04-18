import client from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { NextApiRequest, NextApiResponse } from "next";

// Run every 10 minutes

const makeAttempt = async (res) => {
  // pick a random item and regenerate it
  // fetch govdata (also if lastUpdated changed do that anyway)
  // regenerate summary
  // regenerate arguments
  // await res.revalidate(`/`);
  // await res.revalidate(`/bill/${id}`);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await makeAttempt(res);
  res.send(200);
}
