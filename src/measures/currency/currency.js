import { FloatNum } from "../../core/evaluate/FloatNum";
import { prepareAsyncMeasure } from "../../core/evaluate/measures";
import { currencyUnits } from "./currencyUnits";

export function testCurrencies(assertEvals) {
  assertEvals(`5Kč`, `CZK 5.00`);
  assertEvals(`£5`, `£5.00`);
  assertEvals(`USD5000000`, `$5,000,000.00`);
}

export function testApproximationSymbol(assertEvals) {
  assertEvals(`$22222/4`, `$5,555.50`);
  assertEvals(`$2.2222/4`, `~$0.56`);
}

// TODO: Inject a mock for currency conversions to allow testing

export function docs() {
  return `
### Currency
Over 150 common currencies and conversions between them are supported. Both three-letter codes and common symbols can be used. Currency values are prefixed with \`~\` if they involve rounding or currency conversion.
£100 in $
100Kč in AUD
`;
}

const baseCurrency = "usd";
export const measure = prepareAsyncMeasure({
  name: "currency",
  units: currencyUnits,
  load: (currency) => {
    return window
      .fetch(
        `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${baseCurrency}.json`
      )
      .then((response) => response.json())
      .then((result) => {
        const units = currency.units;
        const rates = result[baseCurrency];
        Object.keys(rates).forEach((currency) => {
          const currencyUnit = units[currency];
          if (currencyUnit != null) {
            currencyUnit.baseUnitValue = new FloatNum(1 / rates[currency]);
          } else {
            // console.log(`Rate for a new currency ${currency}`);
          }
        });
      });
  },
});
