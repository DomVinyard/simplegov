import client from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import dynamic from "next/dynamic";
import Link from "next/link";

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
          bills {
            id
          }
        }
      `,
    });
    const paths = bills.map((params: any) => ({ params }));
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
  return { props: bill };
}

export default function Topic({ id, shortTitle, description }: any) {
  return (
    <>
      <AdminBar {...{ id, shortTitle }} />
      <Link href={"/"}>Home</Link>
      <h1>{shortTitle}</h1>
      <p style={{ fontSize: 30 }}>{description.simplifiedLong}</p>
    </>
  );
}
