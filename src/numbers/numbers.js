import * as Term from "../core/parser/parser.terms.js";
import { matchToken, allSymbolsPattern } from "../core/parser/tokens";
import { BigNum } from "../core/evaluate/BigNum";
import { Value } from "../core/evaluate/Value";
import { textAt } from "../core/evaluate/astCursor";
import { decimalSeparator, groupSeparator } from "./separators.js";

export function testIntegers(assertEvals) {
  assertEvals(`123`, `123`);
}

export function testNegative(assertEvals) {
  assertEvals(`-123`, `-123`);
}

export function testDecimalPoint(assertEvals) {
  assertEvals(`123.005`, `123.005`);
}

export function testGroupSeparator(assertEvals) {
  assertEvals(`6,543.005`, `6,543.005`);
  assertEvals(`6,543,210.005`, `6,543,210.005`);
}

export function testSpaceSeparator(assertEvals) {
  assertEvals(`6 543.005`, `6,543.005`);
}

export function testMagnitudeSuffix(assertEvals) {
  assertEvals(`6K`, `6,000`);
  assertEvals(`6M`, `6,000,000`);
}

export function testPercent(assertEvals) {
  assertEvals(`10%`, `0.1`);
}

export function testFraction(assertEvals) {
  assertEvals(`10/3`, `10/3`);
}

export function testApproximation(assertEvals) {
  assertEvals(`sqrt 10`, `3.16227766016837`);
  assertEvals(`sqrt 4`, `2`);
  assertEvals(`sqrt 4 / sqrt 9`, `2/3`);
  assertEvals(`~10/3`, `3.33333333333333`);
  assertEvals(`~10 / ~3`, `3.33333333333333`);
  assertEvals(`$~10/3`, `~$3.33`);
}

export function docs() {
  return `
## Numbers
.You can use arbitrarily large decimal numbers, with decimal point and group (thousand) separators depending on your browser's language (usually the language of your OS). Spaces can be used as well:
${BigNum.fromNumber(6543210.05)}
100 000
.Numbers can be suffixed with \`K\`, \`M\` or the \`%\` (percent) sign:
5K + 10M
5% * 100
`;
}

const NODE = Term.Number;

export function tokenizerNumber(tokenConfig) {
  // TODO: Split suffix into separate module
  const numberPattern = new RegExp(
    `^(-?\\d(?: (?=\\d)|[.,\\d])*(?:[KM%](?=(?:$|\\s|${allSymbolsPattern(
      tokenConfig
    )})))?)`
  );
  return (line, token) => matchToken(line, numberPattern, token, NODE);
}

// Declared here because it's only needed to avoid a clash with negative numbers
const minusPattern = /^(-)/;
export function tokenizerMinus() {
  return (line, token) => matchToken(line, minusPattern, token, Term.minus);
}

const groupSeparatorPattern = new RegExp(`[ ${groupSeparator}]`, "g");
const decimalSeparatorPattern = new RegExp(`[${decimalSeparator}]`, "g");

// TODO: Somewhere somehow we need to support ~, but it also needs to work for
// ~$10/3, so it might not precede a digit

export function evaluateNumber() {
  return {
    node: NODE,
    evaluate: (state) => {
      const textInENLocale = textAt(state)
        .replace(groupSeparatorPattern, "")
        .replace(decimalSeparatorPattern, ".");

      // TODO: Consider rejecting numbers with multiple decimal separators

      const match = textInENLocale.match(/(-?[0-9.]+)(K|M|%)?/);
      if (match == null) {
        return null;
      }
      const [_, numString, suffix] = match;
      let num = BigNum.fromString(numString);
      return Value.fromNumber(computeSuffix(num, suffix));
    },
  };
}

// TODO: Split suffix into separate module
function computeSuffix(num, suffix) {
  switch (suffix) {
    case "K":
      return num.multiply(BigNum.fromInteger(1000));
    case "M":
      return num.multiply(BigNum.fromInteger(1000000));
    case "%":
      return num.divide(BigNum.fromInteger(100));
  }
  return num;
}
