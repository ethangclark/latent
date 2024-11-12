import { getRepoRepresentation } from "./main";

jest.mock("fs", () => ({
  promises: {
    readdir: jest.fn().mockResolvedValue([]),
    readFile: jest.fn().mockResolvedValue(""),
  },
}));

test("getRepoRepresentation should return a string", async () => {
  const result = await getRepoRepresentation();
  expect(typeof result).toBe("string");
});
