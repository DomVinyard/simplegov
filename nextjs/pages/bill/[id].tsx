import client from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import dynamic from "next/dynamic";
import Link from "next/link";
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
    revalidate: 60,
  };
}

const Argument = ({ argument, depth }: any) => {
  // const style = depth === 0 ? styles.argument : styles.argumentChild;
  return (
    <div className={styles.argumentChild} style={{ marginLeft: `${0}px` }}>
      {/* <div className={styles.position}>{argument.position}</div> */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          className={styles.position}
          src={`/${argument.position}.svg`}
          alt={argument.position}
        />
        <span className={styles.user}>{argument.position}</span>
      </div>
      <div className={styles.content}>
        <p className={styles.argumentP}>{argument.argument}</p>
        <div className={styles.childWrapper}>
          {argument.children?.map((child: any) => (
            <Argument key={child.argument} argument={child} depth={depth + 1} />
          ))}
        </div>
      </div>
    </div>
  );
};

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
      {member && (
        <div
          style={{
            background: `#${member?.partyColour || "444"}`,
            padding: "24px 0",
          }}
        >
          <Inner>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <img width={30} src={`/parties/${member.party}.png`} />
                <span
                  style={{
                    color: "#fff",
                    marginLeft: 8,
                    fontSize: 20,
                    fontWeight: "bold",
                  }}
                >
                  {member.party}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  width={30}
                  src={member.memberPhoto}
                  style={{ borderRadius: "100%" }}
                />
                <span
                  style={{
                    color: "#fff",
                    marginLeft: 8,
                    fontSize: 20,
                  }}
                >
                  {member.name}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <img width={28} src={"/house.png"} />
                <span
                  style={{
                    color: "#fff",
                    marginLeft: 8,
                    fontSize: 20,
                  }}
                >
                  {member.house}
                </span>
              </div>
            </div>
          </Inner>
        </div>
      )}
      <div className={styles.argumentsWrapper}>
        <Inner>
          <h2 className={styles.h2}>
            {arguments_aggregate.aggregate.count} comments
          </h2>
          {props.arguments.map((argument: any) => (
            <Argument key={argument.argument} argument={argument} depth={0} />
          ))}

          {/* <p style={{ opacity: 0.5 }}>{JSON.stringify(props)}</p> */}
        </Inner>
      </div>
      <AdminBar {...{ id, shortTitle }} />
    </>
  );
}
