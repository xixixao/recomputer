import {
  declareAdd,
  declareDivide,
  declareExponentiate,
  declareMultiply,
  declareSubtract,
} from "../../syntax/operators/operatorDeclaration";
import { FloatNum } from "./FloatNum";

export const FloatOps = [
  declareAdd(FloatNum, FloatNum, (a: FloatNum, b: FloatNum) => {
    return new FloatNum(a.value + b.value);
  }),

  declareSubtract(FloatNum, FloatNum, (a: FloatNum, b: FloatNum) => {
    return new FloatNum(a.value - b.value);
  }),

  declareMultiply(FloatNum, FloatNum, (a: FloatNum, b: FloatNum) => {
    return new FloatNum(a.value * b.value);
  }),

  declareDivide(FloatNum, FloatNum, (a: FloatNum, b: FloatNum) => {
    return new FloatNum(a.value / b.value);
  }),

  declareExponentiate(FloatNum, FloatNum, (a: FloatNum, b: FloatNum) => {
    return new FloatNum(Math.pow(a.value, b.value));
  }),
];
