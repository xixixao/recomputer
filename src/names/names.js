import { textAt } from "../core/evaluate/astCursor.js";
import * as Term from "../core/parser/parser.terms.js";
import { matchToken, allSymbolsPattern } from "../core/parser/tokens";

export function testNotPrefix(assertEvals) {
  assertEvals(
    `xy = 3
x = 2
xy`,
    `3`
  );
  assertEvals(
    `y = 3
  2 years`,
    `2 years`
  );
}

export function testMultiwordNames(assertEvals) {
  assertEvals(
    `x y = 3
z = 4 + x y
z`,
    `7`
  );
}

export function testReferences(assertEvals) {
  assertEvals(
    `x = 1
y = 2
x + y`,
    `3`
  );
}

export function docs() {
  return `
## Names
.Values can be assigned names. Names can contain any characters, except for the equal sign, and cannot start with a digit:
x = 3
my income = $100
result 4 = 1/2
`;
}

// TODO: Dont hardcode comment syntax
const nameDeclarationPattern = /^([^= .#](?:[^=]*[^= ])?) *=/;
export const tokenizerNameDeclaration = () => {
  return (line, token) =>
    matchToken(line, nameDeclarationPattern, token, Term.Name);
};

export function tokenizerReference(tokenConfig) {
  const { shouldAnalyzeForNames } = tokenConfig;
  if (!shouldAnalyzeForNames) {
    return () => false;
  }
  const nameEndPattern = new RegExp(
    `^(?:$|\\s|${allSymbolsPattern(tokenConfig)})`
  );

  return (line, token, stack) => {
    const { firstPassResult } = stack.parser;
    if (firstPassResult != null && firstPassResult.scopeCursor == null) {
      firstPassResult.scopeCursor = firstPassResult.cursor();
    }

    return (
      firstPassResult != null &&
      matchName(
        line,
        token,
        stack.context.depth,
        firstPassResult.scopeCursor,
        nameEndPattern
      )
    );
  };
}

function matchName(line, token, indent, names, nameEndPattern) {
  const name = names.search(
    indent,
    token.start,
    (length) => line[length],
    (length) => nameEndPattern.test(line.slice(length))
  );
  if (name == null) {
    return false;
  }
  token.accept(Term.Reference, token.start + name.length);
  return true;
}

export function evaluateReference() {
  return {
    node: Term.Reference,
    evaluate: (state) => state.values.get(textAt(state)),
  };
}
