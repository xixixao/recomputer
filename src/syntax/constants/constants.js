import * as allConstants from "./constantList";

// TODO: Move docs and tests to each constant

export function testConstants(assertEvals) {
  assertEvals(`π`, `3.141592653589793`);
  assertEvals(`PI`, `3.141592653589793`);
  assertEvals(`τ`, `6.283185307179586`);
  assertEvals(`2e^3`, `40.17107384637533`);
}

export function docs() {
  return `
### Constants
Predefined mathematical constants include:
π # or \`PI\`
=3.141592653589793
τ # type it with Alt+T or use \`TAU\`
=6.283185307179586
e
=2.7182818284590451
`;
}

export function constants() {
  return new Map(
    Object.values(allConstants).map(({ symbol, value }) => [symbol, value])
  );
}
