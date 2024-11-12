import * as fs from "fs";
import * as path from "path";
import { getResponseFromO1Preview } from "./openAi";

const filesToExclude = ["node_modules", "yarn.lock"];

async function getRepoRepresentation(): Promise<string> {
  const representation: string[] = [];

  async function scanDirectory(
    currentPath: string,
    indent: string = ""
  ): Promise<void> {
    const entries = await fs.promises.readdir(currentPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      // Skip excluded files/directories
      if (filesToExclude.includes(entry.name)) {
        continue;
      }

      // Skip hidden files and directories
      if (entry.name.startsWith(".")) {
        continue;
      }

      if (entry.isDirectory()) {
        representation.push(`${indent}📁 ${entry.name}/`);
        await scanDirectory(fullPath, indent + "  ");
      } else {
        const content = await fs.promises.readFile(fullPath, "utf8");
        representation.push(`${indent}📄 ${entry.name}:`);
        representation.push(`${indent}${"─".repeat(entry.name.length + 2)}`);
        representation.push(
          content
            .split("\n")
            .map((line) => `${indent}  ${line}`)
            .join("\n")
        );
      }
    }
  }

  try {
    await scanDirectory(process.cwd());
    return representation.join("\n");
  } catch (error) {
    console.error("Error scanning repository:", error);
    return "Error: Unable to scan repository";
  }
}

async function main() {
  const repoRepresentation = await getRepoRepresentation();
  const prompt = `Following is the code used to generate this prompt:

BEGIN REPO REPRESENTATION

${repoRepresentation}

END REPO REPRESENTATION

My fantasy is for this code to be capable of operating as a fully-autonmous remote worker that is capable of any type of remote work.

My actual goal is for this code to be capable of operating as a fully-autonomous (and provably-competent) remote worker in all types of remote works that are possible given 1) the base models it leverages and 2) state-of-the-art prompt engineering.

My strategy is to augment this code until it is capable of autonomously enhancing itself towards acheivement of my goal.

Please do the following:

1. Discuss the challenges I will face in implementing my strategy
2. Select the single challenge that faces the gravest existential threat to achieving my goal
3. Propose a solution for overcoming that challenge
4. Provide concrete implementation details (e.g. code, data, etc.) for your proposed solution
5. Select one piece of your proposed solution that you think would make a nice, small, easy-to-digest, easy-to-approve, standalone PR that would both meaningfully improve existing functionality and move it towards a final solution. Provide all the code for this PR.`;
  console.log(prompt);
  console.log("\n~~~~~!!!!!~~~~~\n");
  const response = await getResponseFromO1Preview([prompt]);
  console.log(response);
}

main();
