export function declare<T>(operator: { template: T }, f: T) {
  return [operator, f];
}
