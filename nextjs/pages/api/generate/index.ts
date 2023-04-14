import { NextApiRequest, NextApiResponse } from "next";
import generate from "./src/generate";
import dotenv from "dotenv";
import client from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import slugify from "slug";
dotenv.config();

const MAX_GENERATIONS_PER_DAY = 200;
const DB_ENDPOINT = process.env.HASURA_ENDPOINT || "http://localhost:8080";
const DB_SECRET = process.env.HASURA_ADMIN_SECRET || "admin_secret";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name } = req.body;
  const slug = slugify(name);
  console.log(`[OpenAI] Generating /${slug}`);

  try {
    if (!name) throw new Error("Missing name");
    const {
      data: {
        topic: [topic],
      },
    } = await client.query({
      query: gql`
        query PRE_GENERATE($slug: String) {
          topic(where: { slug: { _eq: $slug } }) {
            generated_at
          }
        }
      `,
      variables: { slug },
    });

    // check that it exists as a stub
    if (!topic)
      throw new Error(
        "Topic not found. You can only generate descriptions for topics that are related to existing topics."
      );

    // Check that the generated_at field is empty. if not, reject (it's already done)
    // TODO: also check the descriptions length
    if (topic.generated_at) {
      await Promise.all(
        ["5", "20"].map(
          async (audience) => await res.revalidate(`/topic/${slug}/${audience}`)
        )
      );
      return res.json({
        success: false,
        // reload: true,
        error:
          "This topic has already been generated, please try refreshing the page.",
      });
    }

    //
    // Begin generation
    //

    // set the generated_at field to now
    await client.mutate({
      mutation: gql`
        mutation SET_GENERATED_TIMESTAMP($slug: String) {
          update_topic(
            where: { slug: { _eq: $slug } }
            _set: { generated_at: "now()" }
          ) {
            returning {
              generated_at
            }
          }
        }
      `,
      variables: { slug },
    });

    // 24 hours agao
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // check that we havn't had more than n generations in the past 24 hours
    const {
      data: { topic_aggregate },
    } = await client.query({
      query: gql`
        query GENERATION_COUNT($yesterday: timestamptz) {
          topic_aggregate(where: { generated_at: { _gte: $yesterday } }) {
            aggregate {
              count
            }
          }
        }
      `,
      variables: { yesterday },
    });
    const { count } = topic_aggregate.aggregate;
    if (count > MAX_GENERATIONS_PER_DAY)
      throw new Error(
        "Too many topics generated in the past 24 hours. Please try again later."
      );

    const start = Date.now();
    const { data } = await generate({ name });
    const endpoint = `${DB_ENDPOINT}/api/rest/topic`; // switch to apollo
    const body = JSON.stringify(data);
    const dbResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hasura-Admin-Secret": DB_SECRET,
      },
      body,
    });
    const dbData = await dbResponse.json();
    if (dbData.error) throw new Error(dbData.error);
    if (!data) throw new Error("Error generating topic");
    await Promise.all(
      ["5", "20"].map((audience) =>
        res.revalidate(`/topic/${slug}/${audience}`)
      )
    );
    const end = Date.now();
    console.log(`Execution time: ${end - start} ms`);
    return res.json({
      success: true,
      executionTime: `${((end - start) / 1000).toFixed(1)}s`,
      generated: data,
      database: dbData,
    });
  } catch (error: Error | any) {
    console.error(error);
    // TODO, also delete any assets created
    await client.mutate({
      mutation: gql`
        mutation SET_GENERATED_TIMESTAMP($slug: String) {
          update_topic(
            where: { slug: { _eq: $slug } }
            _set: { generated_at: null }
          ) {
            returning {
              generated_at
            }
          }
        }
      `,
      variables: { slug },
    });
    // set generated_At to null

    await Promise.all(
      ["5", "20"].map((audience) =>
        res.revalidate(`/topic/${slug}/${audience}`)
      )
    );
    return res.json({
      error: error?.message as string,
      success: false,
    });
  }
}
