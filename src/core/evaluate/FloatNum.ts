export class FloatNum {
  value: number;
  error: number;

  constructor(value: number, error?: number) {
    this.value = value;
    this.error = error ?? Math.abs((value * Number.EPSILON) / 2);
  }

  toFloat() {
    return this.value;
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

    // TODO: Guard against errorMagnitude outside (0,100)
    const result = (
      errorMagnitude < 0
        ? this.value.toFixed(fractionDigits)
        : this.value.toPrecision(significantDigits)
    )
      .toUpperCase()
      .replace("E+", "E");

    return result.includes("E")
      ? result
      : result.replace(/(?:([1-9])0+|\.0+)$/, "$1").replace(/^-0$/, "0");
  }

  toDisplayStringWithTrailingSpace() {
    return this.toDisplayString();
  }

  toStringWithoutLocaleFormat() {
    return this.toDisplayString();
  }
}
