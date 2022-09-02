import { declare } from "../../syntax/operators/operatorDeclaration";
import { FloatNum } from "./FloatNum";
import {
  abs,
  add,
  ceil,
  divide,
  error,
  exponentiate,
  floor,
  multiply,
  root,
  round,
  sqrt,
  subtract,
} from "../../syntax/operators/operatorList";
import { SigFloatNum } from "./SigFloatNum";

export const FloatOps = [
  declare(
    add,
    nullIfNotFloatNums(
      (a, b) => a.value + b.value,
      (a, b) => Math.hypot(a.error, b.error)
    )
  ),

  declare(
    subtract,
    nullIfNotFloatNums(
      (a, b) => a.value - b.value,
      (a, b) => Math.hypot(a.error, b.error)
    )
  ),

  declare(
    multiply,
    nullIfNotFloatNums(
      (a, b) => a.value * b.value,
      (a, b, c) => c * Math.hypot(a.error / a.value, b.error / b.value)
    )
  ),

  declare(
    divide,
    nullIfNotFloatNums(
      (a, b) => a.value / b.value,
      (a, b, c) => c * Math.hypot(a.error / a.value, b.error / b.value)
    )
  ),

  declare(
    exponentiate,
    nullIfNotFloatNums(
      (a, b) => Math.pow(a.value, b.value),
      (a, b, c) => (c * b.value * a.error) / a.value
    )
  ),

  declare(
    abs,
    nullIfNotFloatNum((a) => Math.abs(a.value))
  ),

  declare(
    floor,
    nullIfNotFloatNum((a) => Math.floor(a.value))
  ),

  declare(
    ceil,
    nullIfNotFloatNum((a) => Math.ceil(a.value))
  ),

  declare(
    round,
    nullIfNotFloatNum((a) => Math.round(a.value))
  ),

  declare(
    sqrt,
    nullIfNotFloatNum((a) => Math.sqrt(a.value))
  ),

  declare(
    root,
    nullIfNotFloatNums((a, b) => Math.pow(a.value, 1 / b.value))
  ),

  // TODO: Track precision separately
  declare(
    error,
    nullIfNotFloatNum((a) => (Number.EPSILON * a.value) / 2)
  ),
];

function none() {
  return undefined;
}

function nullIfNotFloatNums(
  f: (a: SigFloatNum, b: SigFloatNum) => number,
  precision: (
    a: SigFloatNum,
    b: SigFloatNum,
    c: number
  ) => number | undefined = none
) {
  return (a: unknown, b: unknown) => {
    if (!(a instanceof SigFloatNum && b instanceof SigFloatNum)) {
      return null;
    }
    const value = f(a, b);
    return new SigFloatNum(value, precision(a, b, value));
  };
}

function nullIfNotFloatNum(f: (a: SigFloatNum) => number) {
  return (a: unknown) => {
    if (!(a instanceof SigFloatNum)) {
      return null;
    }
    return new SigFloatNum(f(a));
  };
}
