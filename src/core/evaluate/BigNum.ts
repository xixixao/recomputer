import { decimalSeparator } from "../../syntax/numbers/separators";

// @ts-ignore
const currentLocaleNumberFormat = Intl.NumberFormat(window.navigator.locale);

const APPROXIMATE = true;

export class BigNum {
  numerator: bigint;
  denominator: bigint;
  approximate: boolean;

  constructor(numerator: bigint, denominator: bigint, approximate?: boolean) {
    if (typeof numerator !== "bigint") {
      throw new Error(`numerator is not bigint: ${numerator} `);
    }
    if (typeof denominator !== "bigint") {
      throw new Error(`denominator is not bigint: ${denominator}`);
    }
    const divisor = largestCommonDivisor(numerator, denominator);
    const n = numerator / divisor;
    const d = denominator / divisor;
    this.numerator = d < 0 ? -n : n;
    this.denominator = d < 0 ? -d : d;
    this.approximate = approximate ?? false;
  }

  static zero() {
    return new BigNum(0n, 1n);
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
    const [integer, decimal, exponent] = string.split(/\.|e/);
    const denominator = Math.pow(
      10,
      (decimal?.length ?? 0) - parseInt(exponent ?? "0")
    );
    return new BigNum(
      BigInt(`${integer}${decimal ?? ""}`),
      BigInt(denominator),
      approximate
    );
  }

  toStringWithoutLocaleFormat(precision) {
    const { denominator } = this;
    const numerator = this.positiveNumerator();
    const { fraction } = this.fractionString(precision);
    return decimalString(this, String(numerator / denominator), fraction);
  }

  toString(precision) {
    const { fraction } = this.fractionString(precision);
    return decimalStringInLocale(this, fraction);
  }

  // TODO: Consider limiting this to some reasonable number of significant
  // digits in the printed fraction.
  toStringParts(precision) {
    const { numerator, denominator } = this;
    if (this.approximate) {
      return { numerator: this.toString(precision) };
    }
    const { fraction, isExact } = this.fractionString(precision);
    if (isExact) {
      return { numerator: decimalStringInLocale(this, fraction) };
    }
    return {
      numerator: currentLocaleNumberFormat.format(numerator),
      denominator: currentLocaleNumberFormat.format(denominator),
    };
  }

  // TODO: Change this to significant digits, so that
  // 0.00000000123 counts as 3 not 11 - or better even use 1.23E-8
  fractionString(precision) {
    const { denominator } = this;
    const numerator = this.positiveNumerator();
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

  signString() {
    return this.numerator < 0 ? "-" : "";
  }

  positiveNumerator() {
    const { numerator } = this;
    return numerator < 0 ? -numerator : numerator;
  }

  toInteger() {
    const { numerator, denominator } = this;
    if (denominator !== 1n) {
      return null;
    }
    return numberIfAccurateOrNull(numerator);
  }

  toFloat() {
    const numerator = numberIfAccurateOrNull(this.numerator);
    const denominator = numberIfAccurateOrNull(this.denominator);
    if (numerator == null || denominator == null) {
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

  inverseIf(shouldInverse: boolean) {
    return !shouldInverse ? this : this.inverse();
  }

  add(b: BigNum) {
    return new BigNum(
      this.numerator * b.denominator + b.numerator * this.denominator,
      this.denominator * b.denominator,
      this.approximate || b.approximate
    );
  }

  subtract(b: BigNum) {
    return new BigNum(
      this.numerator * b.denominator - b.numerator * this.denominator,
      this.denominator * b.denominator,
      this.approximate || b.approximate
    );
  }

  multiply(b: BigNum) {
    return new BigNum(
      this.numerator * b.numerator,
      this.denominator * b.denominator,
      this.approximate || b.approximate
    );
  }

  divide(b: BigNum) {
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
    if (exponent === 1) {
      return this;
    }
    if (exponent == null || this.approximate) {
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
  modulo(b: BigNum) {
    const babs = b.abs();
    const divided = this.divide(babs);
    if (divided == null) {
      return null;
    }
    return this.subtract(babs.multiply(divided.floor()));
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

  ceil() {
    const { numerator, denominator } = this;
    const fill = numerator % denominator > 0 ? 1n : 0n;
    return new BigNum(numerator / denominator + fill, 1n);
  }

  round() {
    const { numerator, denominator } = this;
    const fill = 2n * (numerator % denominator) >= denominator ? 1n : 0n;
    return new BigNum(numerator / denominator + fill, 1n);
  }
}

function largestCommonDivisor(a, b) {
  if (b === 0n) {
    return a;
  }

  return largestCommonDivisor(b, a % b);
}

function decimalStringInLocale(number, fraction) {
  const { denominator } = number;
  const integerString = currentLocaleNumberFormat.format(
    number.positiveNumerator() / denominator
  );
  return decimalString(number, integerString, fraction);
}

function decimalString(number, integerString, fraction) {
  const signedIntegerString = number.signString() + integerString;
  if (fraction == null) {
    return signedIntegerString;
  }
  return signedIntegerString + decimalSeparator + fraction;
}

// function order(x) {
//   let order = 0;
//   while (x % 10n === 0n) {
//     order++;
//     x /= 10n;
//   }
//   return order;
// }

function numberIfAccurateOrNull(i: bigint): number | null {
  const n = Number(i);
  // @ts-ignore
  return n == i ? n : null;
}
