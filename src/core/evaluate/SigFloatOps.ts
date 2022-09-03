import { floatOperators } from "../../syntax/operators/floatOperators";
import { declare } from "../../syntax/operators/operatorDeclaration";
import {
  abs,
  add,
  ceil,
  divide,
  exponentiate,
  floor,
  multiply,
  root,
  round,
  sqrt,
  subtract,
} from "../../syntax/operators/operatorList";
import { canConvertToFloat } from "./floatable";
import { SigFloatNum } from "./SigFloatNum";

export const SigFloatOps = [
  declare(
    add,
    nullIfNotSigFloatNums((a, b) => a + b, largestUncertainty)
  ),

  declare(
    subtract,
    nullIfNotSigFloatNums((a, b) => a - b, largestUncertainty)
  ),

  declare(
    multiply,
    nullIfNotSigFloatNums((a, b) => a * b, fewestSignificantDigits)
  ),

  declare(
    divide,
    nullIfNotSigFloatNums((a, b) => a / b, fewestSignificantDigits)
  ),

  declare(
    exponentiate,
    nullIfNotSigFloatNums(
      (a, b) => Math.pow(a, b),
      (a, b) => a.significantDigits
    )
  ),

  declare(
    root,
    nullIfNotSigFloatNums(
      (a, b) => Math.pow(a, 1 / b),
      (a) => a.significantDigits
    )
  ),

  declare(
    add,
    convertToFloats((a, b) => a + b)
  ),

  declare(
    subtract,
    convertToFloats((a, b) => a - b)
  ),

  declare(
    multiply,
    convertToFloats((a, b) => a * b)
  ),

  declare(
    divide,
    convertToFloats((a, b) => a / b)
  ),

  declare(
    exponentiate,
    convertToFloats((a, b) => Math.pow(a, b))
  ),

  declare(
    root,
    convertToFloats((a, b) => Math.pow(a, 1 / b))
  ),

  declare(
    abs,
    nullIfNotSigFloatNum((a) => Math.abs(a))
  ),

  declare(
    floor,
    nullIfNotSigFloatNum((a) => Math.floor(a))
  ),

  declare(
    ceil,
    nullIfNotSigFloatNum((a) => Math.ceil(a))
  ),

  declare(
    round,
    nullIfNotSigFloatNum((a) => Math.round(a))
  ),

  declare(
    sqrt,
    nullIfNotSigFloatNum((a) => Math.sqrt(a))
  ),

  ...floatOperators.map((operator) =>
    declare(operator, (a) => {
      if (!(a instanceof SigFloatNum)) {
        return null;
      }
      const result = operator.f(a.value);
      return new SigFloatNum(result, a.significantDigits);
    })
  ),
];

function nullIfNotSigFloatNums(
  f: (a: number, b: number) => number,
  precision: (a: SigFloatNum, b: SigFloatNum, c: number) => number
) {
  return (a: unknown, b: unknown) => {
    if (!(a instanceof SigFloatNum && b instanceof SigFloatNum)) {
      return null;
    }
    const value = f(a.value, b.value);
    return new SigFloatNum(value, precision(a, b, value));
  };
}
function convertToFloats(f: (a: number, b: number) => number) {
  return (a: unknown, b: unknown) => {
    if (a instanceof SigFloatNum === b instanceof SigFloatNum) {
      return null;
    }
    const aValue = toMaybeFloat(a);
    if (aValue == null) {
      // TODO: This null is different, we should not try to execute
      // other methods
      return null;
    }
    const bValue = toMaybeFloat(b);
    if (bValue == null) {
      return null;
    }
    const value = f(aValue, bValue);
    // TODO: What about SciFloat + SigFloat, should compute significant digits
    // for the SciFloat? Probably.
    return new SigFloatNum(
      value,
      a instanceof SigFloatNum
        ? a.significantDigits
        : (b as SigFloatNum).significantDigits
    );
  };
}

function nullIfNotSigFloatNum(f: (a: number) => number) {
  return (a: unknown) => {
    if (!(a instanceof SigFloatNum)) {
      return null;
    }
    return new SigFloatNum(f(a.value), a.significantDigits);
  };
}

function largestUncertainty(a: SigFloatNum, b: SigFloatNum, c: number) {
  const newNumberOfSignificantDecimalDigits = Math.min(
    numberOfSignificantDecimalDigits(a),
    numberOfSignificantDecimalDigits(b)
  );
  return numberOfIntegerDigits(c) + newNumberOfSignificantDecimalDigits;
}

function numberOfIntegerDigits(x: number) {
  return Math.floor(Math.log10(Math.abs(x)) + 1);
}

function numberOfSignificantDecimalDigits(x: SigFloatNum) {
  return Math.max(0, x.significantDigits - numberOfIntegerDigits(x.value));
}

function fewestSignificantDigits(a: SigFloatNum, b: SigFloatNum) {
  return Math.min(a.significantDigits, b.significantDigits);
}

function toMaybeFloat(x: unknown) {
  return x instanceof SigFloatNum
    ? x.value
    : canConvertToFloat(x)
    ? x.toFloat()
    : null;
}
