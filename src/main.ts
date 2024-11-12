import * as fs from "fs";
import * as path from "path";
import { getResponseFromSonnet } from "./anthropic";

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

  ${repoRepresentation}

  My goal is to augment this code until it is capable of working as a fully-automated software engineer. What is the single biggest obstacle that's preventing me from achieving my goal?`;
  console.log(prompt);
  console.log("\n~~~~~~!!!!~~~~~\n");
  const response = await getResponseFromSonnet([prompt]);
  console.log(response);
}

main();
