import { tags } from "@lezer/highlight";
import { Parse } from "../../core/parser/parser";
import { Term } from "../../core/parser/terms";

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

export function Comment(parse: Parse): boolean {
  parse.startNode();
  if (!(StrongComment(parse) || NormalComment(parse))) {
    return parse.endNode();
  }
  return parse.addNode(Term.Comment);
}

export function StrongComment(parse: Parse): boolean {
  parse.startNode();
  if (!parse.match("##")) {
    return parse.endNode();
  }
  parse.matchRegex(/([^\n]*)/);
  return parse.addNode(Term.StrongComment);
}

export function NormalComment(parse: Parse): boolean {
  parse.startNode();
  if (!parse.match("#")) {
    return parse.endNode();
  }
  parse.matchRegex(/([^\n]*)/);
  return parse.addNode(Term.NormalComment);
}

//TODO: Reimplement URLs:
// const urlPattern = /^(https?:\/\/(?:[^\n .,]|[.,](?! |$))*)/;
// export function tokenizerCommentLink() {
//   return (line, token) => matchToken(line, urlPattern, token, Term.URL);
// }
// const commentPattern = /^((?:[^\n](?!https?:\/\/))+)/;
// export function tokenizerCommentContent() {
//   return (line, token) =>
//     matchToken(line, commentPattern, token, Term.commentContent);
// }

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
