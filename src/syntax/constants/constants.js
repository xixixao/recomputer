import * as allConstants from "./constantList";

export function testConstants(assertEvals) {
  assertEvals(`π`, `3.14159265358979`);
  assertEvals(`PI`, `3.14159265358979`);
  assertEvals(`2e^3`, `40.17107384637532`);
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
