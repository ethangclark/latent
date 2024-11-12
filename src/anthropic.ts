import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

type PngImg = Buffer;

/*
Sonnet is an LLM with the following capabilities:
- basic general reasoning
- programming (top-tier, best-in-class on some benchmarks but not others)
- (API calls not implemented in this repo) tool use, including (beta) computer use
- image analysis (not as good as gpt-4o)
- ability to generate moderate-length responses (up to 2000 words)
*/
export async function getResponseFromSonnet(
  content: Array<PngImg | string>
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: content.map((chunk) => {
          if (chunk instanceof Buffer) {
            return {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: chunk.toString("base64"),
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
  });

  const contentBlock = response.content[0];
  if (!contentBlock) {
    throw new Error("No content block in completion from Anthropic.");
  }
  if (!("text" in contentBlock)) {
    throw new Error("No text in completion from Anthropic.");
  }

  return contentBlock.text;
}
