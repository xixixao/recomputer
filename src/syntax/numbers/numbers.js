import { textAt } from "../../core/evaluate/astCursor";
import { BigNum } from "../../core/evaluate/BigNum";
import { Value } from "../../core/evaluate/Value";
import * as Term from "../../core/parser/parser.terms.js";
import { allSymbolsPattern, matchToken } from "../../core/parser/tokens";
import { decimalSeparator, groupSeparator } from "./separators.js";

export function testIntegers(assertEvals) {
  assertEvals(`123`, `123`);
}

export function testNegative(assertEvals) {
  assertEvals(`-123`, `-123`);
  assertEvals(`-1/2`, `-0.5`);
  assertEvals(`-2/3`, `-2/3`);
  assertEvals(`~-2/3`, `-0.66666666666666`);
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

export function testExponentSuffix(assertEvals) {
  assertEvals(`6E3`, `6,000`);
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
  assertEvals(`sqrt 4 / (sqrt 9)`, `2/3`);
  assertEvals(`~10/3`, `3.33333333333333`);
  assertEvals(`~10 / (~3)`, `3.33333333333333`);
  assertEvals(`$~10/3`, `~$3.33`);
}

export function docs() {
  return `
### Numbers
# You can use arbitrarily large decimal numbers, with decimal point and group (thousand) separators depending on your browser's language (usually the language of your OS). Spaces can be used as well:
${BigNum.fromNumber(6543210.05)}
100 000
# Numbers can be suffixed with \`K\`, \`M\`, \`E\` or the \`%\` (percent) sign:
5K + 10M
5% * 100
6.3E8
# Rational numbers (fractions) that cannot be printed exactly as decimal will be printed as fractions. To force a decimal printing use the \`~\` (tilde) symbol:
10/6
~10/6
`;
}

const NODE = Term.Number;

export function tokenizerNumber(tokenConfig) {
  // TODO: Split suffix into separate module
  const numberPattern = new RegExp(
    `^(-?\\d(?: (?=\\d)|[.,\\d])*(?:(?:[KM](?=(?:$|\\s|%|${allSymbolsPattern(
      tokenConfig
    )})))|E\\d+)?%?)`
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

      const match = textInENLocale.match(/(-?[0-9.]+)(K|M|E\d+)?(%)?/);
      if (match == null) {
        return null;
      }
      const [_, numString, exponent, percent] = match;
      let num = BigNum.fromString(numString);
      return Value.fromNumber(
        computePercent(computeExponent(num, exponent), percent)
      );
    },
  };
}

// TODO: Split suffix into separate module
function computeExponent(num, exponent) {
  if (exponent == null) {
    return num;
  }
  switch (exponent) {
    case "K":
      return num.multiply(BigNum.fromInteger(1000));
    case "M":
      return num.multiply(BigNum.fromInteger(1000000));
    default: {
      const n = BigNum.fromInteger(exponent.match(/\d+/));
      return num.multiply(BigNum.fromInteger(10).exponentiate(n));
    }
  }
}

function computePercent(num, percent) {
  if (percent != null) {
    return num.divide(BigNum.fromInteger(100));
  }
  return num;
}
