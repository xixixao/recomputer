import { decimalSeparator } from "../../syntax/numbers/separators";
import { declare } from "../../syntax/operators/operatorDeclaration";
import {
  abs,
  add,
  divide,
  exponentiate,
  multiply,
  subtract,
} from "../../syntax/operators/operatorList";

// @ts-ignore
const currentLocaleNumberFormat = Intl.NumberFormat(window.navigator.locale);

const APPROXIMATE = true;

// TODO: Rename to BigFrac
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

  static fromString(string: string, approximate?: boolean) {
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

  toDisplayString() {
    const { numerator, denominator } = this.toStringParts(null);
    if (denominator == null) {
      return numerator;
    }
    // TODO: Print integer part? 2+2/3 instead of 8/3
    return numerator + "/" + denominator;
  }

  // TODO: Consider limiting this to some reasonable number of significant
  // digits in the printed fraction.
  toStringParts(precision) {
    const { numerator, denominator } = this;
    if (this.approximate) {
      return { numerator: this.toDecimalString(precision) };
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

  toDecimalString(precision) {
    const { fraction } = this.fractionString(precision);
    return decimalStringInLocale(this, fraction);
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
}

export const BigNumOps = [
  declare(
    add,
    nullIfNotBigNums((a: BigNum, b: BigNum) => {
      return new BigNum(
        a.numerator * b.denominator + b.numerator * a.denominator,
        a.denominator * b.denominator,
        a.approximate || b.approximate
      );
    })
  ),

  declare(
    subtract,
    nullIfNotBigNums((a: BigNum, b: BigNum) => {
      return new BigNum(
        a.numerator * b.denominator - b.numerator * a.denominator,
        a.denominator * b.denominator,
        a.approximate || b.approximate
      );
    })
  ),

  declare(
    multiply,
    nullIfNotBigNums((a: BigNum, b: BigNum) => {
      return new BigNum(
        a.numerator * b.numerator,
        a.denominator * b.denominator,
        a.approximate || b.approximate
      );
    })
  ),

  declare(
    divide,
    nullIfNotBigNums((a: BigNum, b: BigNum) => {
      if (b.isZero()) {
        return null;
      }
      return new BigNum(
        a.numerator * b.denominator,
        a.denominator * b.numerator,
        a.approximate || b.approximate
      );
    })
  ),

  declare(
    exponentiate,
    nullIfNotBigNums((a: BigNum, b: BigNum) => {
      const exponent = b.toInteger();
      if (exponent === 1) {
        return a;
      }
      if (exponent == null || a.approximate) {
        const aFloat = a.toFloat();
        const floatExponent = b.toFloat();
        if (aFloat == null || floatExponent == null) {
          return null;
        }
        const result = aFloat ** floatExponent;
        // There is no simple way to tell whether the floating point
        // exponentiation is approximate or not, but this is convenient
        // approximation of whether there is approximation.
        return BigNum.fromNumber(result, result % 1 !== 0);
      }
      let positiveExponent = Math.abs(exponent);
      const [numerator, denominator] =
        exponent > 0
          ? [a.numerator, a.denominator]
          : [a.denominator, a.numerator];
      return new BigNum(
        numerator ** BigInt(positiveExponent),
        denominator ** BigInt(positiveExponent)
      );
    })
  ),

  declare(
    abs,
    nullIfNotBigNum((a: BigNum) => {
      const { numerator, denominator } = a;
      return new BigNum(
        numerator >= 0 ? numerator : -numerator,
        denominator >= 0 ? denominator : -denominator
      );
    })
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

  // abs() {
  //   const { numerator, denominator } = this;
  //   return new BigNum(
  //     numerator >= 0 ? numerator : -numerator,
  //     denominator >= 0 ? denominator : -denominator,
  //     this.approximate
  //   );
  // }

  // floor() {
  //   return new BigNum(this.numerator / this.denominator, 1n);
  // }

  // ceil() {
  //   const { numerator, denominator } = this;
  //   const fill = numerator % denominator > 0 ? 1n : 0n;
  //   return new BigNum(numerator / denominator + fill, 1n);
  // }

  // round() {
  //   const { numerator, denominator } = this;
  //   const fill = 2n * (numerator % denominator) >= denominator ? 1n : 0n;
  //   return new BigNum(numerator / denominator + fill, 1n);
  // }
];

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

function nullIfNotBigNums(f: (a: BigNum, b: BigNum) => any) {
  return (a: unknown, b: unknown) => {
    if (!(a instanceof BigNum && b instanceof BigNum)) {
      return null;
    }
    return f(a, b);
  };
}

function nullIfNotBigNum(f: (a: BigNum) => any) {
  return (a: unknown) => {
    if (!(a instanceof BigNum)) {
      return null;
    }
    return f(a);
  };
}
