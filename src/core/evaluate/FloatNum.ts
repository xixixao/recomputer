export type Floatable = {
  toFloat: () => number;
};

export function canConvertToFloat(a: unknown): a is Floatable {
  return a instanceof Object && "toFloat" in a;
}

export class FloatNum {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  static fromNullable(value: number | null | undefined): FloatNum | null {
    return value == null ? null : new FloatNum(value);
  }

  toDisplayString(): string {
    return this.value.toLocaleString();
  }
}
