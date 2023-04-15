import client from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import Link from "next/link";

export async function getStaticPaths() {
  try {
    const {
      data: { bills },
    } = await client.query({
      query: gql`
        query GET_BILLS {
          bills {
            id
          }
        }
      `,
    });
    const paths = bills.map(({ id }: any) => ({ params: { id } }));
    return { paths, fallback: "blocking" };
  } catch (error) {
    console.error(error);
    return { paths: [], fallback: "blocking" };
  }
}

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
          }
        }
      }
    `,
    variables: { id: params.id },
  });
  console.log(bill);
  return { props: bill };
}

export default function Topic(props: any) {
  return (
    <>
      <Link href={"/"}>Home</Link>
      <h1>{props.shortTitle}</h1>
      <p style={{ fontSize: 30 }}>{props.description.simplifiedLong}</p>
      {/* <p style={{ opacity: 0.4 }}>{JSON.stringify(props)}</p> */}
    </>
  );
}
