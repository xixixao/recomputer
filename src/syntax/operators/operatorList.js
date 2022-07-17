import { Value } from "../../core/evaluate/Value";
import { BigNum } from "../../core/evaluate/BigNum";
import { Units } from "../../core/evaluate/Units";

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
    const unit = Units.fromCompounds(
      right.unit.compounds
        .filter(({ fromDerived }) => !fromDerived)
        .map((compound) => ({
          ...compound,
          exponent: 0,
          required: true,
        }))
    );
    return Value.multiply(unit, left);
  },
};

export const convertUnits2 = {
  symbol: "to",
  regex: "\\bto\\b",
  apply: convertUnits.apply,
};

export const floor = {
  symbol: "floor",
  docs: "The closest smaller integer value.",
  docsPos: "6",
  example: "floor 4.49",
  apply: (value) => Value.from(value.number.floor(), value.unit),
};

export const ceil = {
  symbol: "ceil",
  docs: "The closest bigger integer value.",
  docsPos: "6.1",
  example: "ceil 4.49",
  apply: (value) => Value.from(value.number.ceil(), value.unit),
};

export const round = {
  symbol: "round",
  docs: "The closest integer value.",
  docsPos: "6.2",
  example: "round 4.49",
  apply: (value) => Value.from(value.number.round(), value.unit),
};

export const sqrt = {
  symbol: "sqrt",
  docs: "The square (2nd) root.",
  docsPos: "7",
  example: "sqrt 16",
  apply: (value) => root.apply(Value.fromNumber(BigNum.fromInteger(2)), value),
};

export const sqrt2 = {
  symbol: "√",
  docs: "The square (2nd) root.",
  docsPos: "7.2",
  example: "√36",
  apply: sqrt.apply,
};

export const root = {
  symbol: "rt",
  docs: "The left value root of the right value.",
  docsPos: "8",
  example: "3rt 27",
  regex: "\\brt\\b",
  apply: (left, right) => right.exponentiate(Value.divide(Value.one(), left)),
};

export const exp = {
  symbol: "exp",
  docs: "The number e to the power of the value.",
  docsPos: "9",
  example: "exp 3",
  apply: floatOperator(Math.exp),
};

export const log = {
  symbol: "log",
  docs: "The natural logarithm of the value.",
  docsPos: "10",
  example: "log 3",
  apply: floatOperator(Math.log),
};

export const log2 = {
  symbol: "log2",
  docs: "The base-2 logarithm of the value.",
  docsPos: "11",
  example: "log2 3",
  apply: floatOperator(Math.log2),
};

export const log10 = {
  symbol: "log10",
  docs: "The base-10 logarithm of the value.",
  docsPos: "12",
  example: "log10 3",
  apply: floatOperator(Math.log10),
};

// TODO: Document trig functions
export const sin = {
  symbol: "sin",
  apply: floatOperator(Math.sin),
};

export const sinh = {
  symbol: "sinh",
  apply: floatOperator(Math.sinh),
};

export const asin = {
  symbol: "asin",
  apply: floatOperator(Math.asin),
};

export const asinh = {
  symbol: "asinh",
  apply: floatOperator(Math.asinh),
};

export const cos = {
  symbol: "cos",
  apply: floatOperator(Math.cos),
};

export const cosh = {
  symbol: "cosh",
  apply: floatOperator(Math.cosh),
};

export const acos = {
  symbol: "acos",
  apply: floatOperator(Math.acos),
};

export const acosh = {
  symbol: "acosh",
  apply: floatOperator(Math.acosh),
};

export const tan = {
  symbol: "tan",
  apply: floatOperator(Math.tan),
};

export const tanh = {
  symbol: "tanh",
  apply: floatOperator(Math.tanh),
};

export const atan = {
  symbol: "atan",
  apply: floatOperator(Math.atan),
};

export const atanh = {
  symbol: "atanh",
  apply: floatOperator(Math.atanh),
};

function floatOperator(fn) {
  return (value) =>
    Value.fromNumber(BigNum.fromNumber(fn(value.number.toFloat()), true));
}
