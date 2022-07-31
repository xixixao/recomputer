import {
  convertUnits,
  divide,
  multiply,
} from "../../syntax/operators/operatorList";
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

  static applyUnary(operator, x) {
    if (operator == null || x == null) {
      return null;
    }

    return operator.apply(x);
  }

  static applyBinary(operator, a, b) {
    a = a?.toValue();
    b = b?.toValue();
    if (a == null || b == null) {
      return null;
    }
    if (operator.apply != null) {
      return operator.apply(a, b);
    }
    let unitsValue;
    if (operator.convertUnits) {
      unitsValue = Value.fromUnit(a.unit);
      b = Value.applyBinary(convertUnits, b, unitsValue);
    } else {
      unitsValue = operator.applyUnit(a.unit, b.unit);
    }
    if (b == null || unitsValue == null) {
      return null;
    }
    const number = operator.applyNum(a.number, b.number);
    if (number == null) {
      return null;
    }
    return combine(number, unitsValue);
  }

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

  // Supported exponentiations
  // integer ^ integer (max 100) => bigger exponents need different
  //                                representation, with approximate flag
  //   float ^ integer (max 100)        ditto
  // integer ^ float             => needs approximation flag if not precise
  //   float ^ float                   ditto
  //    unit ^ integer (max 10)
  //    unit ^ float             => only if unit has a consistent power?
  //
  exponentiate(b) {
    if (!b.unit.isScalar()) {
      return null;
    }

    const unitsValue = this.unit.exponentiate(b.number);
    if (unitsValue == null) {
      return null;
    }

    return combine(this.number.exponentiate(b.number), unitsValue);
  }
}

function combine(number, unitsValue) {
  const combinedNumber = multiply.applyNum(number, unitsValue.number);
  return new Value(combinedNumber, unitsValue.unit);
}
