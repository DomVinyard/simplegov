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
        bills(order_by: { lastUpdate: desc }) {
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
  });
  return { props: { bills }, revalidate: 60 };
}

export default function Home({ bills }: any) {
  // return <>{JSON.stringify(props)}</>;
  return (
    <>
      <div style={{ background: "#1d70b8", color: "#fff", padding: "48px 0" }}>
        <Inner>
          <h1 style={{ marginTop: 0, fontSize: 46 }}>
            Welcome to SimpleGOV.UK
          </h1>
          <h2 style={{ fontWeight: "normal" }}>
            These are the laws your politicians are trying to pass right now
          </h2>
        </Inner>
      </div>
      <Inner>
        <div className={styles.billsWrapper}>
          {bills?.map((bill: any) => (
            <Link href={`/bill/${bill.id}`} key={bill.id}>
              <div className={styles.billWrapper}>
                <div
                  style={{
                    width: 50,
                    background: `#${bill.partyColour || "444"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
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
