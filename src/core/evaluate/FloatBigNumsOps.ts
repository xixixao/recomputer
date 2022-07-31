import { declareAdd } from "../../syntax/operators/operatorDeclaration";
import { BigNum } from "./BigNum";
import { Floatable, FloatNum } from "./FloatNum";

export const FloatBigNumsOps = [
  declareAdd(FloatNum, BigNum, floatBig),
  declareAdd(BigNum, FloatNum, bigFloat),
  // ]
  //   add: binaryOp,
  //   subtract: binaryOp,
  //   multiply: binaryOp,
  //   divide: binaryOp,
  //   exponentiate() {},
];

function floatBig(a: FloatNum, b: BigNum) {
  return [a, FloatNum.fromNullable(b.toFloat?.())];
}

function bigFloat(a: BigNum, b: FloatNum) {
  return [FloatNum.fromNullable(a.toFloat?.()), b];
}
