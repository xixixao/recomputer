export function testNestedStatements(assertEvals) {
  assertEvals(
    `x = y
\ty = 1
x`,
    `1`
  );
}

export function docs() {
  return `
### Nesting
# You can nest expressions to limit their scope and declare them below their use:
result = tax * rate
\ttax = 5%
\trate = $9 / month
rate # no corresponding value exists
`;
}
