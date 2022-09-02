// export type Floatable = {
//   toFloat: () => FloatNum;
// };

// export function canConvertToFloat(a: unknown): a is Floatable {
//   return a instanceof Object && "toFloat" in a;
// }

export function evaluateSigFloatNum(
  numString: string,
  exponent: string | null,
  percent: boolean
) {
  const [integer, fraction] = numString.split(".");

  const significantInteger = integer.replace(/^0+/, "");
  const significantFraction = (fraction ?? "").replace(/^0+/, "");
  const significantDigits = Math.max(
    significantInteger.length +
      (significantInteger.length > 0
        ? (fraction ?? "").length
        : significantFraction.length)
  );
  const exponentInt =
    convertExponentToInt(exponent) + convertPercentToExponentInt(percent);

  const value = parseFloat(numString + "e" + exponentInt);
  return new SigFloatNum(value, significantDigits);
}

function convertExponentToInt(exponent: string | null) {
  if (exponent == null) {
    return 0;
  }
  switch (exponent) {
    case "K":
      return 3;
    case "M":
      return 6;
    default: {
      const [_, n] = exponent.match(/E(-?\d+)/)!;
      return parseInt(n);
    }
  }
}

function convertPercentToExponentInt(percent: boolean) {
  return percent ? -2 : 0;
}

export class SigFloatNum {
  value: number;
  significantDigits: number;

  constructor(value: number, significantDigits: number) {
    this.value = value;
    this.significantDigits = significantDigits;
  }

  // toFloat() {
  //   return this;
  // }

  // static fromNullable(value: number | null | undefined): FloatNum | null {
  //   return value == null ? null : new FloatNum(value);
  // }

  // TODO: Localization
  toDisplayString(): string {
    const jsString = this.value.toPrecision(this.significantDigits);
    const normalizedString = jsString.toUpperCase().replace("E+", "E");
    return normalizedString;
  }

  toDisplayStringWithTrailingSpace() {
    return this.toDisplayString();
  }
}
