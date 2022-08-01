export type Operator<T> = { template: T };

export function declare<T extends (...args: any) => any>(
  operator: Operator<T>,
  f: (...args: [...Parameters<T>, Evaluate<T>]) => any
) {
  return [operator, f];
}

type Evaluate<T extends (...args: any) => any> = (
  operator: Operator<T>,
  ...args: Parameters<T>
) => any;
