import OpenAI from "openai";

const openai = new OpenAI();

type PngImg = Buffer;

/*
GPT-4o is an LLM with the following capabilities:
- basic general reasoning
- programming (near-best-in-class on most benchmarks)
- image analysis (best-in-class)
- ability to generate moderate-length responses (up to 2000 words)
*/
export async function getResponseFromGpt4o(
  content: Array<PngImg | string>
): Promise<string> {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: content.map((chunk) => {
          if (chunk instanceof Buffer) {
            return {
              type: "image_url",
              image_url: {
                url: "data:image/png;base64," + chunk.toString("base64"),
              },
            };
          }
          return {
            type: "text",
            text: chunk,
          };
        }),
      },
    ],
    model: "chatgpt-4o-latest",
  });
  const response = completion.choices[0]?.message.content ?? null;
  if (!response) {
    throw new Error("No message in completion from OpenAI.");
  }
  return response;
}

/*
o1 is an LLM with the following capabilities:
- advanced general reasoning
- programming (top-tier, best-in-class on some benchmarks but not others)
- ability to generate long responses (>2000 words)
*/
export async function getResponseFromO1Preview(
  content: Array<string>
): Promise<string> {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: content.map((chunk) => {
          return {
            type: "text",
            text: chunk,
          };
        }),
      },
    ],
    model: "o1-preview",
  });
  const response = completion.choices[0]?.message.content ?? null;
  if (!response) {
    throw new Error("No message in completion from OpenAI.");
  }
  return response;
}
