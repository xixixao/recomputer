import * as allConstants from "./constantList";

export function testConstants(assertEvals) {
  assertEvals(`π`, `3.141592653589793`);
  assertEvals(`PI`, `3.141592653589793`);
  assertEvals(`τ`, `6.283185307179586`);
  assertEvals(`2e^3`, `40.17107384637533`);
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
