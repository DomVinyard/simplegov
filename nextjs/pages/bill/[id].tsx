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
    variables: { id: params.id },
  });
  return { props: { ...bill, arguments: shuffleArray(bill.arguments) } };
}

const Argument = ({ argument, depth }: any) => {
  return (
    <div className={styles.argument} style={{ marginLeft: `${depth * 16}px` }}>
      <div className={styles.position}>{argument.position}</div>
      <p>{argument.argument}</p>
      {argument.children?.map((child: any) => (
        <Argument key={child.argument} argument={child} depth={depth + 1} />
      ))}
    </div>
  );
};

export default function Topic(props: any) {
  const { id, shortTitle, description } = props;
  return (
    <>
      {/* <h1>{shortTitle}</h1> */}
      <p
        className={styles.p}
        dangerouslySetInnerHTML={{
          __html: `${description?.simplifiedLong || "awaiting description"}`,
        }}
      />
      {props.arguments.map((argument: any) => (
        <Argument key={argument.argument} argument={argument} depth={0} />
      ))}

      <AdminBar {...{ id, shortTitle }} />
      {/* <p style={{ opacity: 0.5 }}>{JSON.stringify(props)}</p> */}
    </>
  );
}
