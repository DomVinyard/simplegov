import client from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { NextApiRequest, NextApiResponse } from "next";

// Run every minute

const isDev = process.env.NODE_ENV === "development";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // TODO: if local, take one bill, otherwise take all
    const govResponse = await fetch(
      `https://bills-api.parliament.uk/api/v1/Bills` +
        `?CurrentHouse=All` +
        `&IsDefeated=false` +
        `&IsWithdrawn=false` +
        `&SortOrder=DateUpdatedDescending` +
        `&Take=${isDev ? 1 : 10}`
    );
    const json = await govResponse.json();
    const bills = json.items.map((bill: any) => {
      const { billId, shortTitle, lastUpdate } = bill;
      return { id: `${billId}`, shortTitle, lastUpdate };
    });
    await client.mutate({
      mutation: gql`
        mutation INSERT_BILLS($bills: [bills_insert_input!]!) {
          insert_bills(
            objects: $bills
            on_conflict: {
              constraint: bills_pkey
              update_columns: [lastUpdate, shortTitle]
            }
          ) {
            returning {
              id
            }
          }
        }
      `,
      variables: { bills },
    });
    res.revalidate(`/`);
    return res.status(200).send(`fetched ${bills.length} bills`);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
}
