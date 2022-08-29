import { tags } from "@lezer/highlight";
import { Term } from "../../core/parser/terms";
import { matchToken } from "../../core/parser/tokens";

export function testStrongComments(assertEvals) {
  assertEvals(`## Comment\n3`, `3`);
}

export function testNormalComments(assertEvals) {
  assertEvals(`# Comment\n3`, `3`);
}

export function testPostfixComments(assertEvals) {
  assertEvals(`4 ## Comment`, `4`);
  assertEvals(`4 # Comment`, `4`);
}

export function docs() {
  return `
## Text (Comments)
# As you can see throughout this introduction, free form text can follow a \`#\` (hash). Two or more \`#\`s are highlighted.
x = 1 # Including at the end of a line!
=1
`;
}

const strongCommentPattern = /^(##)/;
export function tokenizerStrongStart() {
  return (line, token) =>
    matchToken(line, strongCommentPattern, token, Term.strongCommentStart);
}

const normalCommentPattern = /^(#)/;
export function tokenizerNormalStart() {
  return (line, token) =>
    matchToken(line, normalCommentPattern, token, Term.NormalCommentStart);
}

const urlPattern = /^(https?:\/\/(?:[^\n .,]|[.,](?! |$))*)/;
export function tokenizerCommentLink() {
  return (line, token) => matchToken(line, urlPattern, token, Term.URL);
}
const commentPattern = /^((?:[^\n](?!https?:\/\/))+)/;
export function tokenizerCommentContent() {
  return (line, token) =>
    matchToken(line, commentPattern, token, Term.commentContent);
}

export const commentStyleTags = {
  "NormalComment/...": tags.lineComment,
  // NormalCommentStart: tags.docComment,
  "StrongComment/...": tags.blockComment,
};

export const commentsHighlight = [
  { tag: tags.blockComment, color: "#f7bf2f", fontWeight: "bold" },
  { tag: tags.lineComment, color: "#e3e3e3" },
  // { tag: tags.docComment, color: "#777" },
];
