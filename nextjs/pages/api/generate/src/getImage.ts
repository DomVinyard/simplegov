import request from "request-promise";

import dotenv from "dotenv";
dotenv.config();

async function getImage({ name }: any) {
  if (!name) return "";
  const options = {
    url: "https://api.bing.microsoft.com/v7.0/images/search",
    qs: {
      q: name,
      count: 1,
      offset: 0,
      mkt: "en-US",
      safeSearch: "Moderate",
    },
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.BING_KEY,
    },
    json: true,
  };
  try {
    const data = await request(options);
    const imageUrl = data.value[0].contentUrl;
    return imageUrl || "";
  } catch (error) {
    throw error;
  }
}

export default getImage;
