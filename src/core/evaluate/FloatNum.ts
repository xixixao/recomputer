export type Floatable = {
  toFloat: () => FloatNum;
};

export function canConvertToFloat(a: unknown): a is Floatable {
  return a instanceof Object && "toFloat" in a;
}

export class FloatNum {
  value: number;
  error: number;

  constructor(value: number, error?: number) {
    this.value = value;
    this.error = error ?? Math.abs((value * Number.EPSILON) / 2);
  }

  toFloat() {
    return this;
  }

  static fromNullable(value: number | null | undefined): FloatNum | null {
    return value == null ? null : new FloatNum(value);
  }

  // TODO: Localization
  toDisplayString(): string {
    // 101
    // +-1000
    // 0.01 +- 0.02

    // If the log is negative, it indicates number of fraction digits
    // if the log is positive, it indicates number of significant digits
    // as log(value) - log(error)
    const errorMagnitude =
      this.error > 0 ? Math.round(Math.log10(this.error)) : 0;
    const fractionDigits = -Math.max(-100, errorMagnitude);
    const valueMagnitude = Math.max(
      0,
      Math.floor(Math.log10(Math.abs(this.value)))
    );
    const significantDigits = Math.max(1, 1 + valueMagnitude - errorMagnitude);

    console.log(this, significantDigits);
    // TODO: Guard against errorMagnitude outside (0,100)
    const result = (
      errorMagnitude < 0
        ? this.value.toFixed(fractionDigits)
        : this.value.toPrecision(significantDigits)
    )
      .toUpperCase()
      .replace("E+", "E");

    // Handles sign but hides accuracy
    const isZero = /0(\.0+)/.test(result);
    // return result;
    return isZero ? "0" : result;
  }

  toDisplayStringWithTrailingSpace() {
    return this.toDisplayString();
  }
}
