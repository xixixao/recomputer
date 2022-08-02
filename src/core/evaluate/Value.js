import { divide, multiply } from "../../syntax/operators/operatorList";
import { BigNum } from "./BigNum";
import { Units } from "./Units";

export class Value {
  constructor(number, unit) {
    this.number = number;
    this.unit = unit;
  }

  static from(number, unit) {
    return new Value(number, unit);
  }

  static fromNumber(number) {
    return new Value(number, Units.scalar());
  }

  static fromMaybeNumber(x) {
    if (x instanceof Value) {
      return x;
    }
    return new Value(x, Units.scalar());
  }

  static fromUnit(unit) {
    return new Value(BigNum.one(), unit);
  }

  static zero() {
    return Value.fromNumber(BigNum.zero());
  }

  static one() {
    return Value.fromNumber(BigNum.one());
  }

  toValue() {
    return this;
  }

  toDisplayString() {
    const { number, unit } = this;
    // const isOne = number.isOne();
    // const isCurrency = unit.isCurrency();
    return unit.toString(number);
    // return `${unit.prefixString()}${number.toString(
    //   isCurrency ? 2 : null
    // )}${unit.postfixString(isOne)}`;
  }

  toInteger() {
    const { number, unit } = this;
    if (!unit.isScalar()) {
      return null;
    }
    return number.toInteger();
  }

  // static equal(a, b) {
  //   if (a == b) {
  //     return true;
  //   }
  //   if (a == null || b == null) {
  //     return false;
  //   }
  //   return BigNum.equal(a.number, b.number) && Units.equal(a.unit, b.unit);
  // }

  // static applyUnary(operator, x) {
  //   if (operator == null || x == null) {
  //     return null;
  //   }

  //   return operator.apply(x);
  // }

  static multiply(a, b) {
    return Value.applyBinary(multiply, a, b);
  }

  multiply(b) {
    return Value.multiply(this, b);
  }

  static divide(a, b) {
    return Value.applyBinary(divide, a, b);
  }

  divide(b) {
    return Value.divide(this, b);
  }
}
