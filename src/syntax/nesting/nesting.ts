import { Parse } from "../../core/parser/parser";
import { Term } from "../../core/parser/terms";

export function testNestedStatements(assertEvals) {
  assertEvals(
    `x = y
\ty = 1
x`,
    `1`
  );
}

export function testDoc(assertEvals) {
  assertEvals(
    `salary = (1 - tax) * gross salary
\ttax = 5%
\tgross salary = $800 / week
salary`,
    `$760.00 / week`
  );
}

export function docs() {
  return `
### Nesting
You can nest expressions to limit their scope and declare them below their use:
salary = (1 - tax) * gross salary
\ttax = 5%
\tgross salary = $800 / week
gross salary # no corresponding value exists
`;
}

export function NestedStatements(parse: Parse): boolean {
  parse.startNode();
  if (!indent(parse)) {
    return parse.endNode();
  }
  while (sameIndent(parse)) {
    parse.BlankLine() || parse.Statement();
  }
  dedent(parse);
  return parse.addNode(Term.NestedStatements);
}

export function indent(parse: Parse): boolean {
  if (!parse.check("\n")) {
    return false;
  }
  // Check if there is an increased indent after the newline
  const isIndent = /^\t+$/.test(parse.peekFrom(1, parse.indentLevel + 1));
  if (!isIndent) {
    return false;
  }
  parse.match("\n");
  parse.indentLevel++;
  return true;
}

export function sameIndent(parse: Parse): boolean {
  const isSamedent = /\t/.test(parse.peek(parse.indentLevel));
  if (!isSamedent) {
    return false;
  }
  parse.pos += parse.indentLevel;
  return true;
}

export function dedent(parse: Parse): void {
  parse.indentLevel--;
  // Go back before the new line so that Statement can consume it
  parse.pos--;
}
