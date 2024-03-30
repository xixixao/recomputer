import { Parse } from "../../core/parser/parser";

export const add = {
  symbol: "+",
  regex: "\\+",
  docs: "Adds two values",
  docsPos: "1",
  example: "1 + 2",
  result: "3",
  template: (_left: unknown, _right: unknown) => {},
  // convertUnits: true,
  // apply: (left, right) => left.add(right),
};

export const subtract = {
  symbol: "-",
  regex: "\\-(?!\\d)",
  docs: "Subtracts right value from left value",
  docsPos: "2",
  example: "2 - 3",
  result: "-1",
  template: (_left: unknown, _right: unknown) => {},
  // convertUnits: true,
  // apply: (left, right) => left.subtract(right),
  // declare: declareBinary('subtract'),
};

export const multiply = {
  symbol: "*",
  regex: "\\*",
  implicit(parse: Parse) {
    return !(
      parse.isAtEnd() ||
      // TODO: After we converted to our own parser this became very hacky.
      // Ideally we want to have a version of each node which only checks,
      // and use it here.
      parse.check("#") ||
      parse.check(")") ||
      parse.check("\n") ||
      parse.checkRegex(parse.config.operators)
    );
  },
  docs: "Multiplies two values",
  docsPos: "3",
  example: "3 * 2",
  result: "6",
  template: (_left: unknown, _right: unknown) => {},
  // apply: (left, right) => left.multiply(right),
  // applyUnit: (leftUnit, rightUnit) => leftUnit.multiply(rightUnit),
  // applyNum: (leftNum, rightNum) => leftNum.multiply(rightNum),
};

export const divide = {
  symbol: "/",
  regex: "\\/",
  docs: "Divides left value by right value",
  docsPos: "4",
  example: "10 / 5",
  result: "2",
  template: (_left: unknown, _right: unknown) => {},
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
  docs: "Raises left value to the power of right value",
  template: (_left: unknown, _right: unknown) => {},
  // apply: (left, right) => left.exponentiate(right),
};

// export const modulo = {
//   symbol: "%",
//   docs: "The positive remainder of dividing left value by right valu",
//   example: "10 % 3",
//   regex: "%",
//   template: (_left: unknown, _right: unknown) => {},
// };

// TODO: Move to separate module
export const convertUnits = {
  symbol: "in",
  regex: "\\bin\\b",
  template: (_left: unknown, _right: unknown) => {},
};

export const convertUnits2 = {
  symbol: "to",
  regex: "\\bto\\b",
  template: (_left: unknown, _right: unknown) => {},
};

export const floor = {
  symbol: "floor",
  docs: "The closest smaller integer value",
  docsPos: "6",
  example: "floor 4.49",
  result: "4",
  template: (_left: unknown) => {},
  // apply: (value) => Value.from(value.number.floor(), value.unit),
};

export const ceil = {
  symbol: "ceil",
  docs: "The closest bigger integer value",
  docsPos: "6.1",
  example: "ceil 4.49",
  result: "5",
  template: (_left: unknown) => {},
  // apply: (value) => Value.from(value.number.ceil(), value.unit),
};

export const round = {
  symbol: "round",
  docs: "The closest integer value",
  docsPos: "6.2",
  example: "round 4.49",
  result: "4",
  template: (_left: unknown) => {},
  // apply: (value) => Value.from(value.number.round(), value.unit),
};

export const sqrt = {
  symbol: "sqrt",
  docs: "The square (2nd) root",
  docsPos: "7",
  example: "sqrt 16",
  result: "4",
  template: (_left: unknown) => {},
  // apply: (value) => root.apply(Value.fromNumber(BigNum.fromInteger(2)), value),
};

export const sqrt2 = {
  symbol: "√",
  docs: "The square (2nd) root",
  docsPos: "7.2",
  example: "√ 36",
  result: "6",
  template: (_left: unknown) => {},
  // apply: sqrt.apply,
};

export const root = {
  symbol: "rt",
  regex: "\\brt\\b",
  docs: "The left value root of the right value",
  docsPos: "8",
  example: "3rt 27",
  result: "3",
  template: (_left: unknown, _right: unknown) => {},
  // apply: (left, right) => right.exponentiate(Value.divide(Value.one(), left)),
};

export const exp = {
  symbol: "exp",
  docs: "The number e to the power of the value",
  docsPos: "9",
  example: "exp 3",
  result: "20.085536923187668",
  f: Math.exp,
  template: (_left: unknown) => {},
};

export const log = {
  symbol: "log",
  docs: "The natural logarithm of the value",
  docsPos: "10",
  example: "log 3",
  result: "1.09861228866811",
  f: Math.log,
  template: (_left: unknown) => {},
};

export const log2 = {
  symbol: "log2",
  docs: "The base-2 logarithm of the value",
  docsPos: "11",
  example: "log2 3",
  result: "1.584962500721156",
  f: Math.log2,
  template: (_left: unknown) => {},
};

export const log10 = {
  symbol: "log10",
  docs: "The base-10 logarithm of the value",
  docsPos: "12",
  example: "log10 3",
  result: "0.477121254719662",
  f: Math.log10,
  template: (_left: unknown) => {},
};

export const abs = {
  symbol: "abs",
  docs: "The absolute value of the number",
  docsPos: "13",
  example: "abs -2",
  result: "2",
  template: (_left: unknown) => {},
};

// TODO: Document trig functions
export const sin = {
  symbol: "sin",
  f: Math.sin,
  template: (_left: unknown) => {},
};

export const sinh = {
  symbol: "sinh",
  f: Math.sinh,
  template: (_left: unknown) => {},
};

export const asin = {
  symbol: "asin",
  f: Math.asin,
  template: (_left: unknown) => {},
};

export const asinh = {
  symbol: "asinh",
  f: Math.asinh,
  template: (_left: unknown) => {},
};

export const cos = {
  symbol: "cos",
  f: Math.cos,
  template: (_left: unknown) => {},
};

export const cosh = {
  symbol: "cosh",
  f: Math.cosh,
  template: (_left: unknown) => {},
};

export const acos = {
  symbol: "acos",
  f: Math.acos,
  template: (_left: unknown) => {},
};

export const acosh = {
  symbol: "acosh",
  f: Math.acosh,
  template: (_left: unknown) => {},
};

export const tan = {
  symbol: "tan",
  f: Math.tan,
  template: (_left: unknown) => {},
};

export const tanh = {
  symbol: "tanh",
  f: Math.tanh,
  template: (_left: unknown) => {},
};

export const atan = {
  symbol: "atan",
  f: Math.atan,
  template: (_left: unknown) => {},
};

export const atanh = {
  symbol: "atanh",
  f: Math.atanh,
  template: (_left: unknown) => {},
};

// TODO: design this properly, right now for debugging
export const error = {
  symbol: "error",
  template: (_value: unknown) => {},
};
