import Argument from "@/components/Argument";
import InfoPanel from "@/components/InfoPanel";
import client from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import dynamic from "next/dynamic";
import { Inner } from "../_app";
import styles from "./[id].module.css";

const AdminBar = dynamic(() => import("./../../components/AdminBar"), {
  loading: () => <p></p>,
});

export async function getStaticPaths() {
  try {
    const {
      data: { bills },
    } = await client.query({
      query: gql`
        query GET_BILLS {
          bills(limit: 10) {
            id
          }
        }
      `,
    });
    const paths = bills.map((params: any) => ({ params }));
    return { paths, fallback: true };
  } catch (error) {
    console.error(error);
    return { paths: [], fallback: true };
  }
}

const shuffleArray = (arr: any[]) => {
  const newArr = arr.slice();
  for (let i = newArr.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
  }
  return newArr;
};

export async function getStaticProps({ params }: any) {
  const {
    data: { bill },
  } = await client.query({
    query: gql`
      query GET_BILLS($id: String!) {
        bill: bills_by_pk(id: $id) {
          id
          shortTitle
          description {
            simplifiedLong
            simplifiedShort
          }
          member: govData(path: "sponsors.[0].member")
          arguments_aggregate {
            aggregate {
              count
            }
          }
          arguments(where: { parentID: { _is_null: true } }) {
            position
            argument
            children {
              position
              argument
            }
          }
        }
      }
    `,
    fetchPolicy: "network-only",
    variables: { id: params.id },
  });
  return {
    props: { ...bill, arguments: shuffleArray(bill.arguments) },
    // revalidate: 60,
  };
}

export default function Topic(props: any) {
  const { id, shortTitle, description, arguments_aggregate, member } = props;
  return (
    <>
      <Inner>
        <div className={styles.billWrapper}>
          <h1 className={styles.h1}>{shortTitle}</h1>
          <p
            className={styles.p}
            dangerouslySetInnerHTML={{
              __html: `${
                description?.simplifiedLong || "awaiting description"
              }`,
            }}
          />
        </div>
      </Inner>
      {member ? <InfoPanel member={member} /> : null}
      <div className={styles.argumentsWrapper}>
        <Inner>
          <h2 className={styles.h2}>
            {arguments_aggregate.aggregate.count} debates
          </h2>
          {props.arguments.map((argument: any) => (
            <Argument key={argument.argument} argument={argument} depth={0} />
          ))}
        </Inner>
      </div>
      <AdminBar {...{ id, shortTitle }} />
    </>
  );
}
