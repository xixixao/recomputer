import { declare } from "../../syntax/operators/operatorDeclaration";
import { multiply } from "../../syntax/operators/operatorList";
import { combine, Value } from "./Value";

export const ValueOps = [
  declare(multiply, (a, b, evaluate) => {
    if (!(a instanceof Value || b instanceof Value)) {
      return null;
    }

    if (!(a instanceof Value && b instanceof Value)) {
      if (a instanceof Value) {
        return combine(b, a, evaluate);
      }
      return combine(a, b, evaluate);
    }

    // let unitsValue;
    // if (operator.convertUnits) {
    // unitsValue = Value.fromUnit(a.unit);
    // b = Value.applyBinary(convertUnits, b, unitsValue);
    // } else {

    // TODO: Possibly use evaluate, but really here it's implementation
    // detail of `Value`
    const unitsValue = a.unit.multiply(b.unit);
    // }
    if (unitsValue == null) {
      return null;
    }
    const number = evaluate(multiply, a.number, b.number);
    if (number == null) {
      return null;
    }
    return combine(number, unitsValue, evaluate);
  }),

  // declare(
  //   divide,
  //   nullIfNotBigNums((a: BigNum, b: BigNum) => {
  //     if (b.isZero()) {
  //       return null;
  //     }
  //     return new BigNum(
  //       a.numerator * b.denominator,
  //       a.denominator * b.numerator,
  //       a.approximate || b.approximate
  //     );
  //   })
  // ),

  // declare(
  //   exponentiate,
  //   nullIfNotBigNums((a: BigNum, b: BigNum) => {
  //     const exponent = b.toInteger();
  //     if (exponent === 1) {
  //       return a;
  //     }
  //     if (exponent == null || a.approximate) {
  //       const aFloat = a.toFloat();
  //       const floatExponent = b.toFloat();
  //       if (aFloat == null || floatExponent == null) {
  //         return null;
  //       }
  //       const result = aFloat ** floatExponent;
  //       // There is no simple way to tell whether the floating point
  //       // exponentiation is approximate or not, but this is convenient
  //       // approximation of whether there is approximation.
  //       return BigNum.fromNumber(result, result % 1 !== 0);
  //     }
  //     let positiveExponent = Math.abs(exponent);
  //     const [numerator, denominator] =
  //       exponent > 0
  //         ? [a.numerator, a.denominator]
  //         : [a.denominator, a.numerator];
  //     return new BigNum(
  //       numerator ** BigInt(positiveExponent),
  //       denominator ** BigInt(positiveExponent)
  //     );
  //   })
  // ),
];
