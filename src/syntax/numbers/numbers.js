import { textAt } from "../../core/evaluate/astCursor";
import { BigNum } from "../../core/evaluate/BigNum";
import { FloatNum } from "../../core/evaluate/FloatNum";
import { SciFloatNum } from "../../core/evaluate/SciFloatNum";
import { Term } from "../../core/parser/newParser";
import { allSymbolsPattern, matchToken } from "../../core/parser/tokens";
import { decimalSeparator, groupSeparator } from "./separators.js";

export function testIntegers(assertEvals) {
  assertEvals(`123`, `123`);
}

export function testNegative(assertEvals) {
  assertEvals(`-123`, `-123`);
  assertEvals(`-1/2`, `-0.5`);
  assertEvals(`-2/3`, `-2/3`);
  // assertEvals(`~-2/3`, `-0.66666666666666`);
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
  assertEvals(`6E-3`, `0.006`);
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
  assertEvals(`sin τ`, `0`);
  assertEvals(`0.1 + 0.2`, `0.3`);

  //// TODO: This prints as a large fraction which is wrong
  // assertEvals(`1.557499999999999`, `1.557499999999999`);

  //// TODO: Rethink/reenable printing fractions
  // assertEvals(`~10/3`, `3.33333333333333`);
  // assertEvals(`~10 / (~3)`, `3.33333333333333`);
  // assertEvals(`$~10/3`, `~$3.33`);
}

export function testAccuracy(assertEvals) {
  assertEvals(`~7.00`, `7.00`);
  assertEvals(`~3.1416*~2.34*~0.58`, `4.3`);
  assertEvals(`~123.62 + ~8.9`, `132.5`);
  assertEvals(`~525 / ~311`, `1.69`);

  // assertEvals(`error 7.00`, `0.01`);
  // assertEvals(`7.00±0.01`, `7.00±0.01`);
}

// TODO: Figure out the localization input story
export function docs() {
  return `
### Numbers
# You can use arbitrarily large decimal numbers, with decimal point and group (thousand) separators depending on your browser's language (usually the language of your OS). Spaces can be used as well:
6543210.05
=6,543,210.05
100 000
=100,000
# Numbers can be suffixed with \`K\`, \`M\` or the \`%\` (percent) sign:
5K + 10M
=10,005,000
5% * 100
=5
# Scientific notation is supported via E suffix:
6.3E8
=630,000,000
6.3E-8
=0.000000063
# Rational numbers (fractions) that cannot be printed exactly as decimal will be printed as fractions. To force a decimal printing use the \`~\` (tilde) symbol with a space (TODO WIP):
10/6
=5/3
~ 10/6
=1.66666666666666
`;
}

const NODE = Term.Number;

export function tokenizerNumber(tokenConfig) {
  // TODO: Split suffix into separate module
  const numberPattern = new RegExp(
    `^(~?-?\\d(?: (?=\\d)|[.,\\d])*(?:(?:[KM](?=(?:$|\\s|%|${allSymbolsPattern(
      tokenConfig
    )})))|E-?\\d+)?%?(?:±[.,\\d]+)?)`
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
      const match = textInENLocale.match(
        /(~?)(-?[0-9.]+)(K|M|E-?\d+)?(%)?(±[.,\d]+)?/
      );
      if (match == null) {
        return null;
      }
      const [_, uncertaintySymbol, numString, exponent, percent, error] = match;
      // TODO: Really this should be split into each module with its own
      // parsing rules for each type of a number
      const isUncertain = uncertaintySymbol !== "" || error != null;
      const isLessThan10 = /^-?[0-9](\.|$)/.test(numString);
      // const isInteger = /^-?[0-9]+$/.test(numString) && (!percent || >1000 );
      const isScientific = /E/.test(exponent);
      if (isUncertain && isLessThan10 && isScientific) {
        if (percent != null) {
          // TODO: Support instead of error
          console.error("Percent and scientific uncertain num not supported");
          return null;
        }
        return evaluateSciFloatNum(numString, exponent, error);
      } else if (isUncertain) {
        return evaluateFloatNum(numString, exponent, percent, error);
        // } else if (isInteger) {
        //   evaluateBigIntNum(numString, )
        // }
      } else {
        return evaluateBigNum(numString, exponent, percent);
      }
      // let num = BigNum.fromString(numString);
      // return computePercent(computeExponent(num, exponent), percent);
    },
  };
}

function evaluateSciFloatNum(numString, exponent) {
  const float = evaluateFloat(numString);
  if (float == null) {
    return null;
  }
  return new SciFloatNum(float, computeScientificExponent(exponent));
}

function evaluateFloatNum(numString, exponent, percent, errorString) {
  let float = evaluateFloat(numString);
  // TODO: Support spaces/zeroes
  if (float == null) {
    return null;
  }
  if (percent != null) {
    float /= 100;
  }
  const [_, decimal] = numString.split(/\./);
  const fractionLength = (decimal ?? "").length;
  let error;
  if (errorString != null) {
    error = parseFloat(errorString.slice(1));
  } else {
    error = Math.pow(10, -fractionLength);
    // TODO: Handle percent more cleanly
    if (percent != null) {
      error /= 100;
    }
  }
  return new FloatNum(float, error);
}

function evaluateBigNum(numString, exponent, percent) {
  return computePercent(
    computeExponent(BigNum.fromString(numString), exponent),
    percent
  );
}

function evaluateFloat(numString) {
  const float = parseFloat(numString);

  const nonTrailing = numString.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  // TODO: Handle underscores/spaces, they should be allowed
  if (float.toString() !== nonTrailing) {
    // TODO: Error
    console.error(`${numString} cannot be represented as a (Sci)Float`);
    return null;
  }
  return float;
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
      const [_, n] = exponent.match(/E(-?\d+)/);
      return num.multiply(BigNum.fromInteger(10).exponentiate(n));
    }
  }
}

function computeScientificExponent(exponent) {
  const [_, n] = exponent.match(/E(-?\d+)/);
  return BigInt(n);
}

function computePercent(num, percent) {
  if (percent != null) {
    return num.divide(BigNum.fromInteger(100));
  }
  return num;
}
