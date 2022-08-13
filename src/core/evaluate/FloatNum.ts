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
    this.error = error ?? (value * Number.EPSILON) / 2;
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
    const errorMagnitude = Math.floor(Math.log10(this.error));
    const maximumFractionDigits = -Math.min(0, errorMagnitude + 1);
    const maximumSignificantDigits = Math.max(
      maximumFractionDigits,
      errorMagnitude
    );

    // return this.value.toPrecision(Math.abs(Math.log10(this.error)));
    // @ts-ignore
    return this.value.toLocaleString(window.navigator.locale, {
      maximumSignificantDigits,
      maximumFractionDigits,
      // Work in latest Chrome, not in Chromium:
      // signDisplay: "negative",
      // roundingPriority: "lessPrecision",
    });
  }
}
