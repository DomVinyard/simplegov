import client from "@/lib/apollo-client";
import Link from "next/link";

import { gql } from "@apollo/client";
import { Inner } from "./_app";
import styles from "./index.module.css";

export async function getStaticProps() {
  const {
    data: { bills },
  } = await client.query({
    query: gql`
      query GET_BILLS {
        bills(
          order_by: { lastUpdate: desc }
          where: {
            _or: [
              { documentLink: { _neq: "NONE" } }
              { documentLink: { _is_null: true } }
            ]
          }
        ) {
          id
          shortTitle
          lastUpdate
          description {
            simplifiedShort
          }
          party: govData(path: "sponsors.[0].member.party")
          partyColour: govData(path: "sponsors.[0].member.partyColour")
        }
      }
    `,
    fetchPolicy: "network-only",
  });
  return {
    props: { bills },
    revalidate: 60,
  };
}

export default function Home({ bills }: any) {
  // return <>{JSON.stringify(props)}</>;
  return (
    <>
      <div className={styles.header}>
        <Inner>
          <h1 className={styles.h1}>Welcome to SimpleGOV.UK</h1>
          <h2 className={styles.h2}>
            These are the laws your politicians are trying to pass right now
          </h2>
        </Inner>
      </div>
      <Inner>
        <div className={styles.billsWrapper}>
          {bills.map((bill: any) => (
            <Link href={`/bill/${bill.id}`} key={bill.id}>
              <div className={styles.billWrapper}>
                <div
                  className={styles.partyWrapper}
                  style={{ background: `#${bill.partyColour || "444"}` }}
                >
                  <img width={30} src={`/parties/${bill.party}.png`} />
                </div>
                <div className={styles.billInner}>
                  <h3 className={styles.h3}>{bill.shortTitle}</h3>
                  <p className={styles.p}>
                    {bill.description?.simplifiedShort ||
                      "Awaiting description"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Inner>
    </>
  );
}
