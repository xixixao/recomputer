import * as allConstants from "./constantList";

export function testConstants(assertEvals) {
  assertEvals(`π`, `3.14159265358979`);
  assertEvals(`PI`, `3.14159265358979`);
  assertEvals(`τ`, `6.28318530717959`);
  assertEvals(`2e^3`, `40.171073846375`);
}

export function docs() {
  return `
### Constants
# Predefined mathematical constants include:
π
PI
e
`;
}

export function constants() {
  return new Map(
    Object.values(allConstants).map(({ symbol, value }) => [symbol, value])
  );
}
