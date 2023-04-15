import client from "@/lib/apollo-client";
import Link from "next/link";

import { gql } from "@apollo/client";

export async function getStaticProps() {
  const {
    data: { bills },
  } = await client.query({
    query: gql`
      query GET_BILLS {
        bills {
          id
          shortTitle
        }
      }
    `,
  });
  return { props: { bills } };
}

export default function Home({ bills }: any) {
  // return <>{JSON.stringify(props)}</>;
  return (
    <div>
      {bills?.map((bill: any) => (
        <Link key={bill.id} href={`/bill/${bill.id}`}>
          <h3>{bill.shortTitle}</h3>
          {/* <p>{JSON.stringify(bill)}</p> */}
        </Link>
      ))}
    </div>
  );
}
