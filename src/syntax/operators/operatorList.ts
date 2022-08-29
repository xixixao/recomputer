import { BigNum } from "../../core/evaluate/BigNum";
import { FloatNum, canConvertToFloat } from "../../core/evaluate/FloatNum";
import { Units } from "../../core/evaluate/Units";
import { Value } from "../../core/evaluate/Value";

export const add = {
  symbol: "+",
  regex: "\\+",
  docs: "Adds two values.",
  docsPos: "1",
  example: "1 + 2",
  result: "3",
  template: (left: unknown, right: unknown) => {},
  // convertUnits: true,
  // apply: (left, right) => left.add(right),
};

export const subtract = {
  symbol: "-",
  regex: "\\-(?!\\d)",
  docs: "Subtracts right value from left value.",
  docsPos: "2",
  example: "2 - 3",
  result: "-1",
  template: (left: unknown, right: unknown) => {},
  // convertUnits: true,
  // apply: (left, right) => left.subtract(right),
  // declare: declareBinary('subtract'),
};

export const multiply = {
  symbol: "*",
  regex: "\\*",
  implicit: true,
  docs: "Multiplies two values.",
  docsPos: "3",
  example: "3 * 2",
  result: "6",
  template: (left: unknown, right: unknown) => {},
  // apply: (left, right) => left.multiply(right),
  // applyUnit: (leftUnit, rightUnit) => leftUnit.multiply(rightUnit),
  // applyNum: (leftNum, rightNum) => leftNum.multiply(rightNum),
};

export const divide = {
  symbol: "/",
  regex: "\\/",
  docs: "Divides left value by right value.",
  docsPos: "4",
  example: "10 / 5",
  result: "2",
  template: (left: unknown, right: unknown) => {},
  // apply: (left, right) => left.divide(right),
  // applyUnit: (leftUnit, rightUnit) => leftUnit.divide(rightUnit),
  // applyNum: (leftNum, rightNum) => leftNum.divide(rightNum),
};

export const exponentiate = {
  symbol: "^",
  regex: "\\^",
  example: "3 ^ 2",
  result: "9",
  docsPos: "5",
  docs: "Raises left value to the power of right value.",
  template: (left: unknown, right: unknown) => {},
  // apply: (left, right) => left.exponentiate(right),
};

// export const modulo = {
//   symbol: "%",
//   docs: "The positive remainder of dividing left value by right value",
//   example: "10 % 3",
//   regex: "%",
//   template: (left: unknown, right: unknown) => {},
// };

// TODO: Move to separate module
export const convertUnits = {
  symbol: "in",
  regex: "\\bin\\b",
  template: (left: unknown, right: unknown) => {},
};

export const convertUnits2 = {
  symbol: "to",
  regex: "\\bto\\b",
  template: (left: unknown, right: unknown) => {},
};

export const floor = {
  symbol: "floor",
  docs: "The closest smaller integer value.",
  docsPos: "6",
  example: "floor 4.49",
  result: "4",
  template: (left: unknown) => {},
  // apply: (value) => Value.from(value.number.floor(), value.unit),
};

export const ceil = {
  symbol: "ceil",
  docs: "The closest bigger integer value.",
  docsPos: "6.1",
  example: "ceil 4.49",
  result: "5",
  template: (left: unknown) => {},
  // apply: (value) => Value.from(value.number.ceil(), value.unit),
};

export const round = {
  symbol: "round",
  docs: "The closest integer value.",
  docsPos: "6.2",
  example: "round 4.49",
  result: "4",
  template: (left: unknown) => {},
  // apply: (value) => Value.from(value.number.round(), value.unit),
};

export const sqrt = {
  symbol: "sqrt",
  docs: "The square (2nd) root.",
  docsPos: "7",
  example: "sqrt 16",
  result: "4",
  template: (left: unknown) => {},
  // apply: (value) => root.apply(Value.fromNumber(BigNum.fromInteger(2)), value),
};

export const sqrt2 = {
  symbol: "√",
  docs: "The square (2nd) root.",
  docsPos: "7.2",
  example: "√ 36",
  result: "6",
  template: (left: unknown) => {},
  // apply: sqrt.apply,
};

export const root = {
  symbol: "rt",
  regex: "\\brt\\b",
  docs: "The left value root of the right value.",
  docsPos: "8",
  example: "3rt 27",
  result: "3",
  template: (left: unknown, right: unknown) => {},
  // apply: (left, right) => right.exponentiate(Value.divide(Value.one(), left)),
};

export const exp = floatOperator({
  symbol: "exp",
  docs: "The number e to the power of the value.",
  docsPos: "9",
  example: "exp 3",
  result: "20.085536923187668",
  f: Math.exp,
});

export const log = floatOperator({
  symbol: "log",
  docs: "The natural logarithm of the value.",
  docsPos: "10",
  example: "log 3",
  result: "1.098612288668110",
  f: Math.log,
});

export const log2 = floatOperator({
  symbol: "log2",
  docs: "The base-2 logarithm of the value.",
  docsPos: "11",
  example: "log2 3",
  result: "1.584962500721156",
  f: Math.log2,
});

export const log10 = floatOperator({
  symbol: "log10",
  docs: "The base-10 logarithm of the value.",
  docsPos: "12",
  example: "log10 3",
  result: "0.477121254719662",
  f: Math.log10,
});

export const abs = {
  symbol: "abs",
  docs: "The absolute value of the number.",
  docsPos: "13",
  example: "abs -2",
  result: "2",
  template: (left: unknown) => {},
};

// TODO: Document trig functions
export const sin = floatOperator({
  symbol: "sin",
  f: Math.sin,
});

export const sinh = floatOperator({
  symbol: "sinh",
  f: Math.sinh,
});

export const asin = floatOperator({
  symbol: "asin",
  f: Math.asin,
});

export const asinh = floatOperator({
  symbol: "asinh",
  f: Math.asinh,
});

export const cos = floatOperator({
  symbol: "cos",
  f: Math.cos,
});

export const cosh = floatOperator({
  symbol: "cosh",
  f: Math.cosh,
});

export const acos = floatOperator({
  symbol: "acos",
  f: Math.acos,
});

export const acosh = floatOperator({
  symbol: "acosh",
  f: Math.acosh,
});

export const tan = floatOperator({
  symbol: "tan",
  f: Math.tan,
});

export const tanh = floatOperator({
  symbol: "tanh",
  f: Math.tanh,
});

export const atan = floatOperator({
  symbol: "atan",
  f: Math.atan,
});

export const atanh = floatOperator({
  symbol: "atanh",
  f: Math.atanh,
});

// TODO: design this properly, right now for debugging
export const error = {
  symbol: "error",
  template: (value: unknown) => {},
};

function floatOperator({ f, ...spec }) {
  spec.declaration = [
    spec,
    (value: unknown) => {
      if (!canConvertToFloat(value)) {
        // TODO: Error
        return null;
      }
      // TODO: Probably should convert to FloatNum as we will need to
      // propagate `precision`
      const float = value.toFloat();
      if (float == null) {
        // TODO: Error
        return null;
      }
      const result = f(float.value);
      const error = Math.max(float.error, (result * Number.EPSILON) / 2);
      return new FloatNum(result, error);
      // return Value.fromNumber(BigNum.fromNumber(fn(value.number.toFloat()), true));
    },
  ];
  return spec;
}
