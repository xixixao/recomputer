import { declare, Evaluate } from "../../syntax/operators/operatorDeclaration";
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
import { BigNum } from "./BigNum";

export const BigNumOps = [
  declare(
    add,
    nullIfNotBigNums((a, b) => {
      return new BigNum(
        a.numerator * b.denominator + b.numerator * a.denominator,
        a.denominator * b.denominator,
        a.approximate || b.approximate
      );
    })
  ),

  declare(
    subtract,
    nullIfNotBigNums((a, b) => {
      return new BigNum(
        a.numerator * b.denominator - b.numerator * a.denominator,
        a.denominator * b.denominator,
        a.approximate || b.approximate
      );
    })
  ),

  declare(
    multiply,
    nullIfNotBigNums((a, b) => a.multiply(b))
  ),

  declare(
    divide,
    nullIfNotBigNums((a, b) => a.divide(b))
  ),

  declare(exponentiate, (a, b) => {
    if (
      !(a instanceof BigNum && (b instanceof BigNum || typeof b === "number"))
    ) {
      return null;
    }
    const integerExponent =
      typeof b === "number" ? (b % 1 === 0 ? b : null) : b.toInteger();
    if (integerExponent === 1) {
      return a;
    }
    if (integerExponent == null || a.approximate) {
      const aFloat = a.toFloat();
      const floatExponent = typeof b === "number" ? b : b.toFloat();
      if (aFloat == null || floatExponent == null) {
        return null;
      }
      const result = aFloat ** floatExponent;
      // There is no simple way to tell whether the floating point
      // exponentiation is approximate or not, but this is convenient
      // approximation of whether there is approximation.
      return BigNum.fromNumber(result, result % 1 !== 0);
    }
    let positiveExponent = Math.abs(integerExponent);
    const [numerator, denominator] =
      integerExponent > 0
        ? [a.numerator, a.denominator]
        : [a.denominator, a.numerator];
    return new BigNum(
      numerator ** BigInt(positiveExponent),
      denominator ** BigInt(positiveExponent)
    );
  }),

  declare(
    abs,
    nullIfNotBigNum((a) => {
      const { numerator, denominator } = a;
      return new BigNum(
        numerator >= 0 ? numerator : -numerator,
        denominator >= 0 ? denominator : -denominator
      );
    })
  ),

  declare(
    floor,
    nullIfNotBigNum((a) => new BigNum(a.numerator / a.denominator, 1n))
  ),

  declare(
    ceil,
    nullIfNotBigNum((a) => {
      const { numerator, denominator } = a;
      const fill = numerator % denominator > 0 ? 1n : 0n;
      return new BigNum(numerator / denominator + fill, 1n);
    })
  ),

  declare(
    round,
    nullIfNotBigNum((a) => {
      const { numerator, denominator } = a;
      const fill = 2n * (numerator % denominator) >= denominator ? 1n : 0n;
      return new BigNum(numerator / denominator + fill, 1n);
    })
  ),

  declare(
    sqrt,
    nullIfNotBigNum((a, evaluate) => evaluate(root, BigNum.fromInteger(2), a))
  ),

  declare(
    root,
    nullIfNotBigNums((a, b, evaluate) =>
      evaluate(exponentiate, b, evaluate(divide, BigNum.one(), a))
    )
  ),

  declare(
    error,
    nullIfNotBigNum((a) => BigNum.zero())
  ),

  // TODO: This should use biginteger modulo instead to be precise and
  // shouldn't use a floor
  // modulo(b: BigNum) {
  //   const babs = b.abs();
  //   const divided = this.divide(babs);
  //   if (divided == null) {
  //     return null;
  //   }
  //   return this.subtract(babs.multiply(divided.floor()));
  // }
];

function nullIfNotBigNums(
  f: (a: BigNum, b: BigNum, evaluate: Evaluate) => any
) {
  return (a: unknown, b: unknown, evaluate: Evaluate) => {
    if (!(a instanceof BigNum && b instanceof BigNum)) {
      return null;
    }
    return f(a, b, evaluate);
  };
}

function nullIfNotBigNum(f: (a: BigNum, evaluate: Evaluate) => any) {
  return (a: unknown, evaluate: Evaluate) => {
    if (!(a instanceof BigNum)) {
      return null;
    }
    return f(a, evaluate);
  };
}
