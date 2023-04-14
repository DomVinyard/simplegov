import client from "@/lib/apollo-client";
import Group from "@/components/Group";
import { gql } from "@apollo/client";
import { GroupsHead } from "@/components/Head";
import styles from "./index.module.css";

const audiences = ["5", "10", "20"];
type Params = {
  params: {
    topic: string;
    audience: string;
  };
};

export async function getStaticPaths() {
  try {
    const paths = audiences.map((audience) => ({ params: { audience } }));
    return {
      paths,
      fallback: "blocking",
    };
  } catch (error) {
    console.error(error);
    return { paths: [{ slug: "error" }], fallback: "blocking" };
  }
}

export async function getStaticProps({ params: { audience } }: Params) {
  const { data } = await client.query({
    query: gql`
      query GET_GROUPS($audience: numeric) {
        group {
          name
          description
          items {
            topic {
              name
              slug
              image
              descriptions(where: { audience: { _eq: $audience } }) {
                extra_short
              }
            }
          }
        }
      }
    `,
    variables: { audience: Number(audience) },
  });
  return {
    props: {
      groups: data.group,
      page: "groups",
      audience,
    },
  };
}

export default function Groups({ groups, audience }: any) {
  return (
    <div className={styles.container}>
      <GroupsHead />
      {groups.map((group: any) => (
        <Group group={group} key={group.slug} audience={audience} />
      ))}
    </div>
  );
}
