import { textAt } from "../../core/evaluate/astCursor";
import { BigNumOps } from "../../core/evaluate/BigNum";
import { evaluateExpression } from "../../core/evaluate/evaluate";
import { FloatBigNumsOps } from "../../core/evaluate/FloatBigNumsOps";
import { FloatOps } from "../../core/evaluate/FloatOps";
import { ValueOps } from "../../core/evaluate/ValueOps";
import * as Term from "../../core/parser/parser.terms";
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
  assertEvals(`sqrt 4`, `2`);
  assertEvals(`√ 4`, `2`);
  assertEvals(`1rt 1`, `1`);
  assertEvals(`2rt 4`, `2`);
  assertEvals(`3rt 27`, `3`);
  assertEvals(`3rt m3`, `1m`);
}

export function docs() {
  const operatorsWithDocs = Object.values(operators).filter(
    ({ docs }) => docs != null
  );
  operatorsWithDocs.sort((a, b) => a.docsPos - b.docsPos);
  return `
### Operators and Functions
# Standard mathematical operators and functions are available:
${operatorsWithDocs
  .map(({ example, docs }) => `${example} # ${docs}`)
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

// TODO move this to the right module
const declarationLookup = new Map();
[]
  .concat(
    BigNumOps,
    FloatOps,
    FloatBigNumsOps,
    ValueOps,
    Object.values(operators)
      .filter((operator) => operator.declaration != null)
      .map((operator) => operator.declaration)
  )
  .forEach(([operator, declaration]) => {
    const declarationList = declarationLookup.get(operator) ?? [];
    declarationLookup.set(operator, declarationList);
    declarationList.push(declaration);
  });

function computeOperation(state) {
  const { cursor } = state;
  const leftType = cursor.type.id;
  const leftText = textAt(state);
  const left = evaluateExpression(state);
  cursor.nextSibling();
  const operatorText = textAt(state);
  const hasInfixOperator = cursor.nextSibling();
  const right = evaluateExpression(state);
  if (!hasInfixOperator && leftType === Term.Reference) {
    const operator = state.operators.get(leftText);
    if (operator == null) {
      // TODO: Error
      return null;
    }
    return evaluateOperator(operator, right);
  }
  const operator = state.operators.get(!hasInfixOperator ? "*" : operatorText);
  return evaluateOperator(operator, left, right);
}

function evaluateOperator(operator, ...args) {
  if (args.some((arg) => arg == null)) {
    return null;
  }
  const declarationList = declarationLookup.get(operator);
  if (declarationList == null) {
    // TODO: Error
    return null;
  }
  for (let declaration of declarationList) {
    const result = declaration(...args, evaluateOperator);
    if (result != null) {
      return result;
    }
  }
  // TODO: Error
  return null;
}

export function prepareOperators(operators) {
  const lookup = new Map();
  operators.forEach((operator) => lookup.set(operator.symbol, operator));
  return lookup;
}
