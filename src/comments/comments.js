import { matchToken } from "../core/parser/tokens";
import * as Term from "../core/parser/parser.terms.js";

export function testStrongComments(assertEvals) {
  assertEvals(`# Comment\n3`, `3`);
}

export function testNormalComments(assertEvals) {
  assertEvals(`. Comment\n3`, `3`);
}

export function testPostfixComments(assertEvals) {
  assertEvals(`4 . Comment`, `4`);
  assertEvals(`4 # Comment`, `4`);
}

export function docs() {
  return `
## Text (Comments)
.As you can see throughout this introduction, free form text can follow a \`#\` (hash) or \`.\` (dot).
x = 1 .Including at the end of a line!
`;
}

const strongCommentPattern = /^(#)/;
export function tokenizerStrongStart() {
  return (line, token) =>
    matchToken(line, strongCommentPattern, token, Term.strongCommentStart);
}

const normalCommentPattern = /^(\.)/;
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
