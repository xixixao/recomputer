export type Operator<T> = { template: T };

export function declare<T extends (...args: any) => any>(
  operator: Operator<T>,
  f: (...args: [...Parameters<T>, Evaluate]) => any
) {
  return [operator, f];
}

export type Evaluate = <T extends (...args: any) => any>(
  operator: Operator<T>,
  ...args: Parameters<T>
) => any;
