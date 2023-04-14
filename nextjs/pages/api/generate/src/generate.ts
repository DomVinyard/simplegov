import slugify from "slug";
import runGPTQuery from "./runGPTQuery";
import getImage from "./getImage";

const MAX_RELATED = 5;
const RATE_OFFSET = 10; //ms

const trim = (item: string) =>
  item.replace(/^[^a-zA-Z0-9]*|[^a-zA-Z0-9]*$/g, "").trim();

const parseRelated = ({ relatedBulletString }: any) =>
  relatedBulletString
    .split(",")
    .map((item: string) => {
      const trimmed = trim(item);
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    })
    .slice(0, MAX_RELATED);

const audiences = [
  { key: 5, token: "5 year old", request: "use words I can understand" },
  {
    key: 20,
    token: "non-technical adult",
    request: "use language I would understand",
  },
];

const lengths = [
  {
    key: "extra_short",
    token: { 5: "15 words or less", 20: "20 words or less" },
  },
  { key: "long", token: { 5: "about 100 words", 20: "about 200 words" } },
] as any;

const generate = async ({ name }: { name: string }) => {
  try {
    const slug = slugify(name);
    const queries = [];
    for (const audience of audiences) {
      for (const length of lengths) {
        queries.push({
          type: "description",
          audience: audience.key,
          length: length.key,
          key: `${audience.key}_${length.key}`,
          system: `I am a ${audience.token}, so ${
            audience.request
          }. The length of your reply should be ${length.token[audience.key]}.`,
          query: `What is ${name}?`,
        });
      }
    }
    queries.push({
      key: "parent",
      system:
        "Use three words or less. If there is no simple answer, reply with just the word 'none'.",
      query: `What field does ${name} belong to?`,
    });
    queries.push({
      type: "related",
      system: `Show up to ${MAX_RELATED} items. Each item should be no more than 1-2 words in length. Please use a comma to separate each item with no additional formatting.`,
      query: `What are some popular topics similar to ${name}?`,
    });

    const result = {
      topics: [{ name, slug, image: await getImage({ name }) }],
      descriptions: [],
      relationships: [],
      hierarchies: [],
    } as any;

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    // run all queries in parallel
    await Promise.all(
      queries.map(async (query, i) => {
        try {
          await sleep(i * RATE_OFFSET);
          console.log("running", query.query);
          if (query.key === "parent") {
            const parent = await runGPTQuery({
              query: query.query,
              system: query.system,
            });
            const grandparent = await runGPTQuery({
              system: "Reply with three words or less.",
              query: `What field does ${parent} belong to? If there is no simple answer, reply with just the word 'none'.`,
            });
            result.hierarchies.push({
              parent_slug: slugify(`${parent}`),
              child_slug: slug,
            });
            result.topics.push({
              name: trim(`${parent}`),
              slug: slugify(`${parent}`),
              image: await getImage({ name: parent }),
            });
            result.hierarchies.push({
              parent_slug: slugify(`${grandparent}`),
              child_slug: slugify(`${parent}`),
            });
            result.topics.push({
              name: trim(`${grandparent}`),
              slug: slugify(`${grandparent}`),
              image: await getImage({ name: grandparent }),
            });
          }
          if (query.type === "related") {
            const response = await runGPTQuery({
              query: query.query,
              system: query.system,
            });
            const parsedRelated = parseRelated({
              relatedBulletString: response,
            });
            if (parsedRelated.length < 2) return;
            const relatedDescriptionQueries =
              parsedRelated.length < 2
                ? []
                : parsedRelated
                    .map((related: unknown) => {
                      return audiences.map((audience, i) => {
                        return {
                          name: related,
                          key: `related_${i}_${audience.key}`,
                          audience,
                          system: `I am a ${audience.token}, so use language I would understand. The length of your reply should be 15 words or less.`,
                          query: `What is the relationship between ${name} and ${related}?`,
                        };
                      });
                    })
                    .flat();
            (
              await Promise.all(
                relatedDescriptionQueries.map(async (query: any, i: number) => {
                  await sleep(i * RATE_OFFSET);
                  const description = await runGPTQuery({
                    query: query.query,
                    system: query.system,
                  });
                  return {
                    key: query.key,
                    name: query.name,
                    audience: query.audience.key,
                    description,
                  };
                })
              )
            ).forEach(async (related, i) => {
              const related_slug = slugify(related.name);
              if (!result.topics.find((t: any) => t.slug === related_slug)) {
                result.topics.push({
                  name: related.name,
                  slug: related_slug,
                  image: await getImage({ name: related.name }),
                });
              }
              result.relationships.push({
                from_slug: slug,
                to_slug: related_slug,
                description: related.description,
                audience: related.audience,
                priority: i,
              });
            });
          }
          if (query.type === "description") {
            const response = await runGPTQuery({
              query: query.query,
              system: query.system,
            });
            if (
              !result.descriptions.find(
                (d: any) => d.audience === query.audience
              )
            ) {
              result.descriptions.push({
                topic_slug: slug,
                audience: query.audience,
              });
            }
            result.descriptions.find((d: any) => d.audience === query.audience)[
              query.length as string
            ] = response;
            // set short as extra_short for backwards compatibility
            if (query.length === "extra_short") {
              result.descriptions.find(
                (d: any) => d.audience === query.audience
              ).short = response;
            }
          }
        } catch (e) {
          throw e;
        }
      })
    );
    // set 10 === 5 for backwards compatibility
    result.descriptions.push({
      ...result.descriptions.find((d: any) => d.audience === 5),
      audience: 10,
    });
    return { slug, data: result };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export default generate;

// // if running from command line, save to a local file
// const runGenerate = async () => {
//   // const name = process?.argv
//   //   ?.find((arg: any) => arg.includes("--topic"))
//   //   ?.split("=")[1] as string;
//   const name = "Test";
//   const { slug, data } = await generate({ name });
//   fs.writeFileSync(`./generated/${slug}.json`, JSON.stringify(data));
// };
// // if (process.argv.find((arg) => arg.includes("--topic")))
// runGenerate();
// console.log("hi");
