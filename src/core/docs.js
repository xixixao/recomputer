import { modules } from "../modules";

let result = "";
const allDocs = Object.values(modules).map(({ docs }) => docs());
for (const doc of allDocs) {
  result += doc.trim() + "\n\n";
}
export const docs = result.trim();
