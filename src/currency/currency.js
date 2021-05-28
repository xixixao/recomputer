export function testCurrencies(assertEvals) {
  assertEvals(`5Kč`, `CZK 5.00`);
  assertEvals(`£5`, `£5.00`);
  assertEvals(`USD5000000`, `$5,000,000.00`);
}

export function testApproximationSymbol(assertEvals) {
  assertEvals(`$22222/4`, `$5,555.50`);
  assertEvals(`$2.2222/4`, `~$0.56`);
}

export function docs() {
  return `
## Currency
.Over 150 common currencies and conversions between them are supported. Both three-letter codes and common symbols can be used:
£100 in $
100Kč in AUD
`;
}
