import { modules } from "../modules";

const TEST_PREFIX = "=";
const STRIP_TESTS_REGEX = new RegExp(`^${TEST_PREFIX}.*$\n?`, "gm");

let result = "";
const allDocs = Object.values(modules).map(({ docs }) => docs());
for (const doc of allDocs) {
  result += doc.replace(STRIP_TESTS_REGEX, "").trim() + "\n\n";
}
export const docs = result.trim();

export function testDocs(assertEvals) {
  Object.entries(modules).map(([module, { docs }]) => {
    const text = docs();
    const lines = text.split("\n");
    let input = "";
    lines.forEach((line) => {
      try {
        if (line?.startsWith(TEST_PREFIX)) {
          const output = line.slice(1);
          assertEvals(input, output);
          input = "";
        } else {
          input += "\n" + line;
        }
      } catch (error) {
        throw new Error(`In \`${module}\`: ${error.message}`);
      }
    });
  });
}
