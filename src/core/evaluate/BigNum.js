import { decimalSeparator } from "../../numbers/separators";

const currentLocaleNumberFormat = Intl.NumberFormat(window.navigator.locale);

const APPROXIMATE = true;

export class BigNum {
  constructor(numerator, denominator, approximate) {
    if (typeof numerator !== "bigint") {
      throw new Error(`numerator is not bigint: ${numerator} `);
    }
    if (typeof denominator !== "bigint") {
      throw new Error(`denominator is not bigint: ${denominator}`);
    }
    const divisor = largestCommonDivisor(numerator, denominator);
    this.numerator = numerator / divisor;
    this.denominator = denominator / divisor;
    this.approximate = approximate ?? false;
  }

  static one() {
    return new BigNum(1n, 1n);
  }

  static fromInteger(integer) {
    return new BigNum(BigInt(integer), 1n);
  }

  static fromNumber(number, approximate) {
    return BigNum.fromString(`${number}`, approximate);
  }

  static fromString(string, approximate) {
    const [integer, decimal] = string.split(".");
    const denominator = Math.pow(10, decimal?.length ?? 0);
    return new BigNum(
      BigInt(`${integer}${decimal ?? ""}`),
      BigInt(denominator),
      approximate
    );
  }

  toStringWithoutLocaleFormat(precision) {
    const { numerator, denominator } = this;
    return decimalString(this, numerator / denominator, precision);
  }

  toString(precision) {
    const { numerator, denominator } = this;
    // if Im whole decimal
    //   print decimal
    // otherwise need to print separately the numerator and denominator
    return decimalString(
      this,
      currentLocaleNumberFormat.format(numerator / denominator),
      precision
    );
  }

  toStringParts(precision) {
    const { numerator, denominator } = this;
    if (this.approximate) {
      return { numerator: this.toString(precision) };
    }
    const { fraction, isExact } = this.fractionString(precision);
    if (isExact) {
      const integerString = currentLocaleNumberFormat.format(
        numerator / denominator
      );
      return {
        numerator:
          integerString + (fraction == null ? "" : decimalSeparator + fraction),
      };
    }
    return {
      numerator: currentLocaleNumberFormat.format(numerator),
      denominator: currentLocaleNumberFormat.format(denominator),
    };
  }

  fractionString(precision) {
    const { numerator, denominator } = this;

    let remainder = (numerator % denominator) * 10n;
    if (remainder === 0n) {
      return { fraction: null, isExact: true };
    }
    let fraction = "";
    precision = precision ?? 14;
    precision = Math.max(2, precision - fraction.length);
    for (let i = precision; remainder > 0 && i > 0; i--) {
      fraction += remainder / denominator;
      remainder = (remainder % denominator) * 10n;
    }

    return { fraction, isExact: remainder === 0n };
  }

  toInteger() {
    const { numerator, denominator } = this;
    if (denominator !== 1n) {
      return null;
    }
    const result = Number(numerator);
    if (numerator != result) {
      return null;
    }
    return result;
  }

  toFloat() {
    const numerator = Number(this.numerator);
    const denominator = Number(this.denominator);
    if (numerator != this.numerator || denominator != this.denominator) {
      return null;
    }
    return numerator / denominator;
  }

  isZero() {
    return this.numerator === 0n;
  }

  isOne() {
    return this.numerator === 1n && this.denominator === 1n;
  }

  // static equal(a, b) {
  //   return a.numerator === b.numerator && a.denominator === b.denominator;
  // }

  toApproximate() {
    return new BigNum(this.numerator, this.denominator, APPROXIMATE);
  }

  inverse() {
    return new BigNum(this.denominator, this.numerator, this.approximate);
  }

  add(b) {
    return new BigNum(
      this.numerator * b.denominator + b.numerator * this.denominator,
      this.denominator * b.denominator,
      this.approximate || b.approximate
    );
  }

  subtract(b) {
    return new BigNum(
      this.numerator * b.denominator - b.numerator * this.denominator,
      this.denominator * b.denominator,
      this.approximate || b.approximate
    );
  }

  multiply(b) {
    return new BigNum(
      this.numerator * b.numerator,
      this.denominator * b.denominator,
      this.approximate || b.approximate
    );
  }

  divide(b) {
    if (b.isZero()) {
      return null;
    }
    return new BigNum(
      this.numerator * b.denominator,
      this.denominator * b.numerator,
      this.approximate || b.approximate
    );
  }

  exponentiate(b) {
    const exponent = b.toInteger();
    if (exponent == null) {
      const a = this.toFloat();
      const floatExponent = b.toFloat();
      if (a == null || floatExponent == null) {
        return null;
      }
      const result = a ** floatExponent;
      // There is no simple way to tell whether the floating point
      // exponentiation is approximate or not, but this is convenient
      // approximation of whether there is approximation.
      return BigNum.fromNumber(result, result % 1 !== 0);
    }
    let positiveExponent = Math.abs(exponent);
    const [numerator, denominator] =
      exponent > 0
        ? [this.numerator, this.denominator]
        : [this.denominator, this.numerator];
    return new BigNum(
      numerator ** BigInt(positiveExponent),
      denominator ** BigInt(positiveExponent)
    );
  }

  // TODO: This should use biginteger modulo instead to be precise and
  // shouldn't use a floor
  modulo(b) {
    const babs = b.abs();
    return this.subtract(babs.multiply(this.divide(babs).floor()));
  }

  abs() {
    const { numerator, denominator } = this;
    return new BigNum(
      numerator >= 0 ? numerator : -numerator,
      denominator >= 0 ? denominator : -denominator,
      this.approximate
    );
  }

  floor() {
    return new BigNum(this.numerator / this.denominator, 1n);
  }
}

function largestCommonDivisor(a, b) {
  if (b === 0n) {
    return a;
  }

  return largestCommonDivisor(b, a % b);
}

function decimalString(number, integerString, precision) {
  const { fraction } = number.fractionString(precision);
  if (fraction == null) {
    return integerString;
  }
  return integerString + decimalSeparator + fraction;
}

// function order(x) {
//   let order = 0;
//   while (x % 10n === 0n) {
//     order++;
//     x /= 10n;
//   }
//   return order;
// }
