import { Value } from "../../core/evaluate/Value";
import { BigNum } from "../../core/evaluate/BigNum";

export const add = {
  symbol: "+",
  docs: "Adds two values.",
  docsPos: "1",
  example: "1 + 2",
  regex: "\\+",
  convertUnits: true,
  applyNum: (leftNum, rightNum) => leftNum.add(rightNum),
};

export const subtract = {
  symbol: "-",
  docs: "Subtracts right value from left value.",
  docsPos: "2",
  example: "2 - 3",
  regex: "\\-",
  convertUnits: true,
  applyNum: (leftNum, rightNum) => leftNum.subtract(rightNum),
};

export const multiply = {
  symbol: "*",
  docs: "Multiplies two values.",
  docsPos: "3",
  example: "3 * 2",
  regex: "\\*",
  applyUnit: (leftUnit, rightUnit) => leftUnit.multiply(rightUnit),
  applyNum: (leftNum, rightNum) => leftNum.multiply(rightNum),
};

export const divide = {
  symbol: "/",
  docs: "Divides left value by right value.",
  docsPos: "4",
  example: "10 / 5",
  regex: "\\/",
  applyUnit: (leftUnit, rightUnit) => leftUnit.divide(rightUnit),
  applyNum: (leftNum, rightNum) => leftNum.divide(rightNum),
};

export const exponentiate = {
  symbol: "^",
  example: "3 ^ 2",
  docsPos: "5",
  docs: "Raises left value to the power of right value.",
  regex: "\\^",
  apply: (left, right) => left.exponentiate(right),
};

// export const modulo = {
//   symbol: "%",
//   docs: "The positive remainder of diving left value by right value",
//   example: "10 % 3",
//   regex: "%",
//   apply: (left, right) => ({
//     value: left?.value.modulo(right?.value),
//   }),
// };

// TODO: Move to separate module
export const convertUnits = {
  symbol: "in",
  regex: "\\bin\\b",
  apply: (left, right) => {
    const scale = Value.divide(left, right);
    return Value.multiply(right, scale);
  },
};

export const floor = {
  symbol: "floor",
  docs: "The closest smaller integer value.",
  docsPos: "6",
  example: "floor 4.49",
  apply: (value) => Value.from(value.number.floor(), value.unit),
};

export const sqrt = {
  symbol: "sqrt",
  docs: "The square (2nd) root.",
  docsPos: "7",
  example: "sqrt 16",
  apply: (value) => root.apply(Value.fromNumber(BigNum.fromInteger(2)), value),
};

export const root = {
  symbol: "rt",
  docs: "The left value root of the right value.",
  docsPos: "8",
  example: "3rt 27",
  regex: "\\brt\\b",
  apply: (left, right) => right.exponentiate(Value.divide(Value.one(), left)),
};
