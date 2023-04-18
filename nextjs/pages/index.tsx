import client from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { Inner } from "./_app";
import styles from "./index.module.css";
import BillCard from "@/components/BillCard";
import { indexes, stages } from "@/lib/stages";

const H1 = "Welcome to SimpleGOV.UK";
const H2 = "These are the laws your politicians are trying to pass right now";

export async function getStaticProps() {
  const {
    data: { bills },
  } = await client.query({
    query: gql`
      query GET_BILLS {
        bills(
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
          isAct: govData(path: "isAct")
          party: govData(path: "sponsors.[0].member.party")
          partyColour: govData(path: "sponsors.[0].member.partyColour")
          arguments_aggregate {
            aggregate {
              count
            }
          }
          stage: govData(path: "currentStage.stageId")
        }
      }
    `,
    fetchPolicy: "network-only",
  });
  return {
    props: {
      bills: bills.filter((bill: any) => {
        return !bill.isAct;
      }),
    },
    revalidate: 60,
  };
}

export default function Home({ bills }: any) {
  return (
    <>
      <div className={styles.header}>
        <Inner>
          <h1 className={styles.h1}>{H1}</h1>
          <h2 className={styles.h2}>{H2}</h2>
        </Inner>
      </div>
      <Inner>
        <div className={styles.billsWrapper}>
          {bills
            .sort((a: any, b: any) => {
              const aStage = stages.find((s) => s.id === a.stage) as any;
              const bStage = stages.find((s) => s.id === b.stage) as any;
              const aIndex = indexes.indexOf(aStage.id);
              const bIndex = indexes.indexOf(bStage.id);
              return bIndex - aIndex;
            })
            .map((bill: any) => (
              <BillCard bill={bill} key={bill.id} />
            ))}
        </div>
      </Inner>
    </>
  );
}
