export const LAST_RESULT_SYMBOL = "_";

export function testLastResult(assertEvals) {
  assertEvals(
    `3
_`,
    `3`
  );
  assertEvals(
    `x = 2
_`,
    `2`
  );
}

export function docs() {
  return `
### Last result
# To quickly refer to the last result use the \`_\` (underscore) symbol.
6 * 8
=48
_ + 2
`;
}

export function saveLastResult(state, value) {
  state.values.set(LAST_RESULT_SYMBOL, value);
}
