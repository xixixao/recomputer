import * as currency from "../currency/currency";

export function testConvertUnits(assertEvals) {
  assertEvals(`3000g in kg`, `3kg`);
}

export function testPrefixes(assertEvals) {
  assertEvals(`$1`, `$1.00`);
  assertEvals(`$3`, `$3.00`);
  assertEvals(`4$`, `$4.00`);
  assertEvals(`$(2+3)`, `$5.00`);
  assertEvals(`(2+4)$`, `$6.00`);
  assertEvals(`$3^3`, `$27.00`);
  assertEvals(
    `x = 3
$x`,
    `$3.00`
  );
  assertEvals(
    `x = 3
  x $`,
    `$3.00`
  );
}

export function testUnitSimplification(assertEvals) {
  assertEvals(`(m / s) * s`, `1m`);
  assertEvals(`3kg m / 3m`, `1kg`);
}

export function testMultipleUnits(assertEvals) {
  assertEvals(`1m s`, `1m*s`);
}

export function testAddRates(assertEvals) {
  assertEvals(`1m/s + 1km/s`, `1,001m/s`);
  assertEvals(`2/year + 1/month`, `14 / year`);
  assertEvals(`1/month + 24/year`, `3 / month`);
}

export function testMagnitudePrefix(assertEvals) {
  assertEvals(`1km`, `1km`);
  assertEvals(`1km / m`, `1,000`);
  assertEvals(`1 megameter in m`, `1,000,000m`);
}

export function testLengthMeasure(assertEvals) {
  assertEvals(`1 foot in m`, `0.3048m`);
  assertEvals(`1 acre in m2`, `4,046.8564224m^2`);
  assertEvals(`1000m2 in km2`, `0.001km^2`);
}

export function testTimeMeasure(assertEvals) {
  assertEvals(`minute / second`, `60`);
  assertEvals(`hour / minute`, `60`);
  assertEvals(`day / hour`, `24`);
  assertEvals(`1 years`, `1 year`);
  assertEvals(`2 year`, `2 years`);
  assertEvals(`12 months in year`, `1 year`);
  assertEvals(`12 months in years`, `1 year`);
  assertEvals(`2 years in months`, `24 months`);
}

export function docs() {
  return `
# Measures`;
}

export const modules = {
  currency,
  space: {
    docs() {
      return `
## Space (Length, Area, Volume...)
.Meters, litres and imperial units are supported:
10m + 2 inches in ft
10m3 in l
`;
    },
  },
  prefixes: {
    docs() {
      return `
## Prefixes
.A metric prefix can be used with any physical measurement unit:
10km
1MN
`;
    },
  },
};
