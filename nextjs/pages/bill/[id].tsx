import client from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import dynamic from "next/dynamic";
import Link from "next/link";
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
            simplifiedShort
          }
        }
      }
    `,
    variables: { id: params.id },
  });
  return { props: bill };
}

export default function Topic(props: any) {
  const { id, shortTitle, description } = props;
  return (
    <>
      <AdminBar {...{ id, shortTitle }} />
      <Link href={"/"}>Home</Link>
      {/* <h1>{shortTitle}</h1> */}
      <p
        className={styles.p}
        dangerouslySetInnerHTML={{ __html: `${description.simplifiedLong}` }}
      />
      <p style={{ opacity: 0.5 }}>{JSON.stringify(props)}</p>
    </>
  );
}
