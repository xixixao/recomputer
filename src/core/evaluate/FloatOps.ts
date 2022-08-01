import { declare } from "../../syntax/operators/operatorDeclaration";
import { FloatNum } from "./FloatNum";
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

export const FloatOps = [
  declare(
    add,
    nullIfNotFloatNums((a, b) => a.value + b.value)
  ),

  declare(
    subtract,
    nullIfNotFloatNums((a, b) => a.value - b.value)
  ),

  declare(
    multiply,
    nullIfNotFloatNums((a, b) => a.value * b.value)
  ),

  declare(
    divide,
    nullIfNotFloatNums((a, b) => a.value / b.value)
  ),

  declare(
    exponentiate,
    nullIfNotFloatNums((a, b) => Math.pow(a.value, b.value))
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
];

function nullIfNotFloatNums(f: (a: FloatNum, b: FloatNum) => number) {
  return (a: unknown, b: unknown) => {
    if (!(a instanceof FloatNum && b instanceof FloatNum)) {
      return null;
    }
    return new FloatNum(f(a, b));
  };
}

function nullIfNotFloatNum(f: (a: FloatNum) => number) {
  return (a: unknown) => {
    if (!(a instanceof FloatNum)) {
      return null;
    }
    return new FloatNum(f(a));
  };
}
