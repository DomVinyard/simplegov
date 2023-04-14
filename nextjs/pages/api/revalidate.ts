import client from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check for secret to confirm this is a valid request
  // if (req.query.secret !== process.env.REVALIDATE_SECRET) {
  //   return res.status(401).json({ message: "Invalid token" });
  // }

  try {
    // This should be the actual path not a rewritten path
    // e.g. for "/blog/[slug]" this should be "/blog/post-1"
    const slug = req.query.slug || req.body;

    const {
      data: {
        topic: [topic],
      },
    } = await client.query({
      query: gql`
        query REVALIDATE($slug: String) {
          topic(where: { slug: { _eq: $slug } }) {
            related: relatedFrom {
              slug: from_slug
            }
          }
        }
      `,
      variables: { slug },
    });

    const related = [
      ...(new Set(topic.related.map((r: any) => r.slug)) as any),
    ];

    console.log("revalidating", related);

    if (!slug) {
      return res.status(400).send("Missing slug");
    }
    // await res.revalidate(`/${slug}`);
    // for (const audience of ["5", "20"]) {
    //   await res.revalidate(`/topic/${slug}/${audience}`);
    //   await res.revalidate(`/groups/${audience}`);
    // }

    await Promise.all(
      ["5", "20"]
        .map((audience) => [
          res.revalidate(`/groups/${audience}`),
          ...[slug, ...related].map((s) =>
            res.revalidate(`/topic/${s}/${audience}`)
          ),
        ])
        .flat()
    );

    // console.log({ revalidationRes });
    return res.json({ revalidated: true });
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    console.error(err);
    return res.status(500).send("Error revalidating");
  }
}
