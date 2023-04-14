import Full from "./Full";
import dynamic from "next/dynamic";
import client from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { TopicHead } from "@/components/Head";

const Stub = dynamic(() => import("../../../../components/Stub"), {
  loading: () => <p></p>,
});

const audiences = ["5", "20"];
type Params = {
  params: {
    topic: string;
    audience: string;
  };
};

export async function getStaticPaths() {
  try {
    const { data } = await client.query({
      query: gql`
        query ALL_TOPICS {
          topics: topic {
            topic: slug
          }
        }
      `,
    });
    const paths = audiences
      .map((audience) =>
        data.topics.map((topic: any) => ({ params: { ...topic, audience } }))
      )
      .flat();
    return {
      paths,
      fallback: "blocking",
    };
  } catch (error) {
    console.error(error);
    return { paths: [{ slug: "error" }], fallback: "blocking" };
  }
}

export async function getStaticProps({
  params: { topic: slug, audience },
}: Params) {
  const {
    data: {
      topic: [topic],
    },
  } = await client.query({
    query: gql`
      query GET_TOPIC($slug: String, $audience: numeric) {
        topic(where: { slug: { _eq: $slug } }) {
          slug
          name
          image
          descriptions(where: { audience: { _eq: $audience } }) {
            extra_short
            long
          }
          parent {
            topic: parent {
              slug
              name
              grandparent: parent {
                topic: parent {
                  slug
                  name
                }
              }
            }
          }
          relationships(where: { audience: { _eq: $audience } }) {
            to {
              slug
              name
              image
              descriptions: descriptions_aggregate {
                aggregate {
                  count
                }
              }
            }
            description
          }
        }
      }
    `,
    variables: { slug, audience: Number(audience) },
  });
  const isStub = !topic.descriptions?.length;
  console.log(`[Next.js] Built /${slug}/${audience}${isStub ? " - Stub" : ""}`);
  return {
    props: { ...topic, isStub, audience, page: isStub ? "stub" : "topic" },
  };
}

export default function Topic(props: any) {
  if (!props.slug) return <p>Not found</p>;
  return (
    <>
      <TopicHead {...props} />
      {props.isStub ? <Stub {...props} /> : <Full {...props} />}
    </>
  );
}
