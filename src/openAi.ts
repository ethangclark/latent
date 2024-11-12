import OpenAI from "openai";

const openai = new OpenAI();

/*
"o1 preview" is an LLM with the following capabilities:
- advanced general reasoning
- programming (top-tier, best-in-class on some benchmarks but not others)
- ability to generate long responses (>2000 words)

The full version of o1 is expected to have top-tier capabilities in all areas of AI
(including image analysis, which "o1 preview" does not have)
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
