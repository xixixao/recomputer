export type Floatable = {
  toFloat: () => number;
};

export function canConvertToFloat(a: unknown): a is Floatable {
  return a instanceof Object && "toFloat" in a;
}
