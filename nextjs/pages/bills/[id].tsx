// import { PdfReader } from "pdfreader";
import pdfParse from "pdf-parse";
const request = require("request-promise");
const axios = require("axios");
import { Configuration, OpenAIApi } from "openai";

import fs from "fs";
import Link from "next/link";

export async function getStaticPaths() {
  try {
    const res = await fetch(
      "https://bills-api.parliament.uk/api/v1/Bills?CurrentHouse=All&OriginatingHouse=Commons&IsDefeated=false&IsWithdrawn=false&SortOrder=DateUpdatedDescending&Take=2"
    );
    const json = await res.json();
    const paths = json.items.map((bill: any) => ({
      params: { id: `${bill.billId}`, ...bill },
    }));
    return { paths, fallback: "blocking" };
  } catch (error) {
    console.error(error);
    return { paths: [], fallback: "blocking" };
  }
}

const runGPTQuery = async ({ query, system = "" }: any) => {
  try {
    const configuration = new Configuration({ apiKey: process.env.OPENAI_KEY });
    const openai = new OpenAIApi(configuration);
    const { data } = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 400,
      messages: [
        { role: "system", content: `${system}` },
        {
          role: "user",
          content: query,
        },
      ],
    });
    return data?.choices?.[0]?.message?.content;
  } catch (e) {
    console.log(e);
  }
};

export async function getStaticProps({ params, props }: any) {
  const { id } = params;
  const generateRaw = async (id: string) => {
    const endpoint = `https://bills-api.parliament.uk/api/v1/Bills/${id}/Publications`;
    const res = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/pdf",
      },
    });
    const { publications } = await res.json();
    const publication_url = publications.filter(
      (pub: any) => pub.publicationType.name === "Bill"
    )?.[0]?.links?.[0]?.url;
    if (!publication_url) return "";
    const pdf = await request(
      `https://app.scrapingbee.com/api/v1/?api_key=${process.env.SCRAPER_API_KEY}&url=${publication_url}&premium_proxy=True&render_js=False`,
      {
        encoding: null,
        timeout: 30000,
      }
    );
    // fs.writeFileSync("test.pdf", pdf, "binary");
    const { text } = await pdfParse(pdf);
    fs.mkdirSync(`../data/${id}`);
    fs.writeFileSync(`../data/${id}/raw.txt`, text, "utf8");
    return text;
  };

  const generateSimplified = async (text: string) => {
    const CHAR_LIMIT = 10000;
    try {
      const simplified = (await runGPTQuery({
        system: ``,
        query: `I am a ten year old. Your job is to summarize UK Legislation in a way that i can understand. Try and use as few political words as possible. In your response you should explain what the bill means and why people want to do it. With that in mind, please describe the following bill: \n\n${text.slice(
          0,
          CHAR_LIMIT
        )}`,
      })) as string;
      fs.writeFileSync(`../data/${id}/simplified.txt`, simplified, "utf8");
      return simplified;
    } catch (error) {
      console.error(error);
    }
  };

  // read file from local directory
  let raw, simplified;
  try {
    raw = fs.readFileSync(`../data/${id}/raw.txt`, "utf8");
  } catch (error) {
    raw = await generateRaw(id);
  }
  if (!raw) return { props: { ...params, simplified: "No description" } };
  try {
    simplified = fs.readFileSync(`../data/${id}/simplified.txt`, "utf8");
  } catch (error) {
    simplified = await generateSimplified(raw);
  }
  return { props: { ...params, simplified: `${simplified}` } };
}

export default function Topic(props: any) {
  return (
    <>
      <Link href={"/"}>Home</Link>
      <p style={{ fontSize: 30 }}>{props.simplified}</p>
      {/* <p style={{ opacity: 0.4 }}>{JSON.stringify(props)}</p> */}
    </>
  );
}
