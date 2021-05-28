import { locales } from "../../core/build/locales.js";
import { currencyCodes } from "./currencyCodes.js";

// Run this to get the list of currencies with all supported symbols
// `node build/buildCurrencies.mjs`
printCurrencyConfig();

function printCurrencyConfig() {
  const baseSymbols = getSymbols("en", currencyCodes);

  const symbolToCurrency = {};
  for (const currency of Object.keys(baseSymbols)) {
    symbolToCurrency[baseSymbols[currency]] = currency;
  }

  for (const locale of locales) {
    const localeCurrencies = getSymbols(locale, currencyCodes);
    for (const currency of Object.keys(localeCurrencies)) {
      const symbol = localeCurrencies[currency];
      if (baseSymbols[currency] !== symbol) {
        const existingCurrency = symbolToCurrency[symbol];
        if (existingCurrency != null && existingCurrency != currency) {
          console.log(
            `// Ignoring clashing currency symbol ${symbol} for currency ${currency} in locale ${locale}`
          );
        } else {
          symbolToCurrency[symbol] = currency;
        }
      }
    }
  }

  const result = {};
  for (const [symbol, currency] of Object.entries(symbolToCurrency)) {
    result[currency] ??= {
      symbols: [],
    };
    result[currency].symbols.push(symbol);
  }

  console.log("export const currencyUnits = " + JSON.stringify(result));
}

function getSymbols(locale, currencyCodes) {
  const result = {};
  for (const currency of currencyCodes) {
    // for (const currencyDisplay of ["symbol", "name"]) {
    for (const { type, value } of Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
    }).formatToParts()) {
      if (type === "currency") {
        result[currency] = value;
        break;
      }
    }
    // }
  }
  return result;
}
