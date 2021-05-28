import { textAt } from "../core/evaluate/astCursor";
import { evaluateExpression } from "../core/evaluate/evaluate";
import { Value } from "../core/evaluate/Value";
import * as Term from "../core/parser/parser.terms";
import * as operators from "./operatorList";

export function testAdd(assertEvals) {
  assertEvals(`1 + 1`, `2`);
}

export function testFloor(assertEvals) {
  assertEvals(`floor 1.1`, `1`);
}

export function testExponentiate(assertEvals) {
  assertEvals(`1 ^ 1`, `1`);
  assertEvals(`1.2 ^ 1`, `1.2`);
  assertEvals(`4 ^ 0.5`, `2`);
  assertEvals(`1m m`, `1m^2`);
  assertEvals(`1m m m`, `1m^3`);
  assertEvals(`1m^3`, `1m^3`);
  assertEvals(`1m km2`, `1,000,000m^3`);
  assertEvals(`1m^3 kg / m ^ 2`, `1m*kg`);
}

export function testRoot(assertEvals) {
  assertEvals(`1rt 1`, `1`);
  assertEvals(`2rt 4`, `2`);
  assertEvals(`3rt 27`, `3`);
}

export function docs() {
  const operatorsWithDocs = Object.values(operators).filter(
    ({ docs }) => docs != null
  );
  operatorsWithDocs.sort((a, b) => a.docsPos - b.docsPos);
  return `
## Operators and Functions
.Standard mathematical operators and functions are available:
${operatorsWithDocs
  .map(({ example, docs }) => `${example} .${docs}`)
  .join("\n")}
`;
}

export function evaluateBinaryExpression() {
  return {
    node: Term.BinaryExpression,
    evaluate: (state) => {
      const { cursor } = state;
      cursor.firstChild();
      const value = computeOperation(state);
      cursor.parent();
      return value;
    },
  };
}

function computeOperation(state) {
  const { cursor } = state;
  const leftType = cursor.type.id;
  const leftText = textAt(state);
  const left = evaluateExpression(state);
  cursor.nextSibling();
  const operatorText = textAt(state);
  cursor.nextSibling();
  const right = evaluateExpression(state);
  if (operatorText === "" && leftType === Term.Reference) {
    const operator = state.operators.get(leftText);
    if (operator != null) {
      return Value.applyUnary(state.operators.get(leftText), right);
    }
  }
  const operator = state.operators.get(
    operatorText === "" ? "*" : operatorText
  );
  return Value.applyBinary(operator, left, right);
}

export function prepareOperators(operators) {
  const lookup = new Map();
  operators.forEach((operator) => lookup.set(operator.symbol, operator));
  return lookup;
}
