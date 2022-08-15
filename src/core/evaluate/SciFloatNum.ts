import { FloatNum } from "./FloatNum";

export class SciFloatNum {
  value: number;
  exponent: bigint;
  error: number;

  constructor(value: number, exponent: bigint, error?: number) {
    this.value = value;
    this.exponent = exponent;
    this.error = error ?? (value * Number.EPSILON) / 2;
  }

  toFloat() {
    // TODO: Handle out-of-range errors, pass down precision
    return new FloatNum(Math.pow(this.value, Number(this.exponent)));
  }

  // TODO: Localization
  toDisplayString(): string {
    // 101
    // +-1000
    // 0.01 +- 0.02

    // If the log is negative, it indicates number of fraction digits
    // if the log is positive, it indicates number of significant digits
    const errorMagnitude = Math.floor(Math.log10(this.error));
    const maximumFractionDigits = -Math.min(0, errorMagnitude + 1);
    const maximumSignificantDigits = Math.max(
      maximumFractionDigits,
      errorMagnitude
    );

    // return this.value.toPrecision(Math.abs(Math.log10(this.error)));
    // @ts-ignore
    return (
      this.value.toLocaleString(window.navigator.locale, {
        maximumSignificantDigits,
        maximumFractionDigits,
        // Work in latest Chrome, not in Chromium:
        // signDisplay: "negative",
        // roundingPriority: "lessPrecision",
      }) +
      "E" +
      this.exponent
    );
  }
}
