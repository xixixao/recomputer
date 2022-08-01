import { declare } from "../../syntax/operators/operatorDeclaration";
import { FloatNum } from "./FloatNum";
import {
  abs,
  add,
  divide,
  exponentiate,
  multiply,
  subtract,
} from "../../syntax/operators/operatorList";

export const FloatOps = [
  declare(
    add,
    nullIfNotFloatNums((a: FloatNum, b: FloatNum) => {
      return new FloatNum(a.value + b.value);
    })
  ),

  declare(
    subtract,
    nullIfNotFloatNums((a: FloatNum, b: FloatNum) => {
      return new FloatNum(a.value - b.value);
    })
  ),

  declare(
    multiply,
    nullIfNotFloatNums((a: FloatNum, b: FloatNum) => {
      return new FloatNum(a.value * b.value);
    })
  ),

  declare(
    divide,
    nullIfNotFloatNums((a: FloatNum, b: FloatNum) => {
      return new FloatNum(a.value / b.value);
    })
  ),

  declare(
    exponentiate,
    nullIfNotFloatNums((a: FloatNum, b: FloatNum) => {
      return new FloatNum(Math.pow(a.value, b.value));
    })
  ),
];

function nullIfNotFloatNums(f: (a: FloatNum, b: FloatNum) => any) {
  return (a: unknown, b: unknown) => {
    if (!(a instanceof FloatNum && b instanceof FloatNum)) {
      return null;
    }
    return f(a, b);
  };
}
