import { textAt } from "../../core/evaluate/astCursor.js";
import { Parse } from "../../core/parser/parser.js";
import { Term } from "../../core/parser/terms.js";
import { allSymbolsPattern } from "../../core/parser/tokens";
import { maybeResetList } from "../list/list.js";

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

// TODO: Fix currency print out
export function docs() {
  return `
### Names
# Values can be assigned names. Names can contain any characters, except for the equal sign, and cannot start with a digit:
x = 3
=3
my income = $100
=$100.00
result 4 = 1/2
=0.5
`;
}

export function Assignment(parse: Parse): boolean {
  parse.startNode();
  if (!Name(parse)) {
    return parse.endNode();
  }
  parse.consumeRegex(/ *= */);
  parse.expression();
  return parse.addNode(Term.Assignment);
}

// TODO: Dont hardcode comment syntax
const NAME_DECLARATION_PATTERN = /^([^= .#](?:[^=]*[^= ])?) *=/;

export function Name(parse: Parse): boolean {
  parse.startNode();
  if (!parse.matchRegex(NAME_DECLARATION_PATTERN)) {
    return parse.endNode();
  }
  return parse.addNode(Term.Name);
}

const NAME_END_PATTERN = /^(?:$|\s|[+-/*%^=()])/;

export function Reference(parse: Parse): boolean {
  // Skip for results editor
  const { shouldAnalyzeForNames } = parse.config;
  if (!shouldAnalyzeForNames) {
    return false;
  }

  if (parse.scopesCursor == null) {
    return false;
  }

  const line = parse.input.chunk(parse.pos);
  const name = parse.scopesCursor.search(
    parse.indentLevel,
    parse.pos,
    (length: number) => line[length],
    (length: number) => NAME_END_PATTERN.test(line.slice(length))
  );
  if (name == null) {
    return false;
  }
  parse.startNode();
  parse.pos += name.length;
  return parse.addNode(Term.Reference);
}

export function evaluateReference() {
  return {
    node: Term.Reference,
    evaluate: (state) => {
      const name = textAt(state);
      const value = maybeResetList(state, name);
      return value ?? state.values.get(name);
    },
  };
}
