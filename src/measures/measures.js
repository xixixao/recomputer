import * as currency from "./currency/currency";
import * as length from "./length/length";
import * as magnitude from "./magnitude/magnitude";
import * as time from "./time/time";
import * as mass from "./mass/mass";
import * as temperature from "./temperature/temperature";
import * as derived from "./derived/derived";

export function testConvertUnits(assertEvals) {
  assertEvals(`3000g in kg`, `3kg`);
}

export function docs() {
  return `
## Measures`;
}

export const modules = {
  currency,
  magnitude,
  length,
  time,
  mass,
  temperature,
  // derived,
};

export const measures = Object.values(modules).map(({ measure }) => measure);
