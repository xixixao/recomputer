export function testNestedStatements(assertEvals) {
  assertEvals(
    `x = y
\ty = 1
x`,
    `1`
  );
}

export function testDoc(assertEvals) {
  assertEvals(
    `salary = (1 - tax) * gross salary
\ttax = 5%
\tgross salary = $800 / week
salary`,
    `$760.00 / week`
  );
}

export function docs() {
  return `
### Nesting
# You can nest expressions to limit their scope and declare them below their use:
salary = (1 - tax) * gross salary
\ttax = 5%
\tgross salary = $800 / week
net salary # no corresponding value exists
`;
}
