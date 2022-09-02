import * as angle from "./angle/angle";
import * as currency from "./currency/currency";
import * as derived from "./derived/derived";
import * as electricity from "./electricity/electricity";
import * as length from "./length/length";
import * as magnitude from "./magnitude/magnitude";
import * as mass from "./mass/mass";
import * as temperature from "./temperature/temperature";
import * as time from "./time/time";

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
  angle,
  time,
  mass,
  temperature,
  electricity,
  derived,
};

export const measures = Object.values(modules).map(({ measure }) => measure);
