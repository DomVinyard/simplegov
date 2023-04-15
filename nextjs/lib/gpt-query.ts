import { Configuration, OpenAIApi } from "openai";

const runGPTQuery = async ({ query = "", system = "" }: any) => {
  try {
    console.log("gpt", { env: process.env.OPENAI_KEY });
    const configuration = new Configuration({ apiKey: process.env.OPENAI_KEY });
    const openai = new OpenAIApi(configuration);
    const { data } = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 400,
      messages: [
        { role: "system", content: system },
        { role: "user", content: query },
      ],
    });
    // const response = await openai.listModels();
    // console.log({ response: response.data.data });
    console.log({ data });
    return data?.choices?.[0]?.message?.content;
  } catch (e) {
    console.log(e);
  }
};

export default runGPTQuery;
