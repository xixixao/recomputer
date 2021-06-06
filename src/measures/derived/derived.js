import * as measures from "./derivedMeasures";

export function testDerivedUnits(assertEvals) {
  assertEvals(`N/kg`, `1m/s^2`);
  assertEvals(`N*s2`, `1kg*m`);
  assertEvals(`N*s`, `1kg*m/s`);
  assertEvals(`N/kg2`, `1m/kg*s^2`);
  assertEvals(`N*kg`, `1N*kg`);
  assertEvals(`N / (m kg/s2)`, `1`);
  assertEvals(`m*N/kg`, `1m^2/s^2`);
  assertEvals(`(1/kg)*N`, `1m/s^2`);
  assertEvals(`N*m*g`, `1N*m*g`);
  assertEvals(`N/s`, `1N/s`);
  assertEvals(`(1/N)*s`, `1s/N`);
  assertEvals(`m*N`, `1m*N`);
  assertEvals(`m*N in m`, `1m^2*kg/s^2`);
}

export function testRequiredDerivedUnitWithOppositeExponent(assertEvals) {
  assertEvals(`kg*m*s2 in N`, `1N*s^4`);
}

export function testRequiredDerivedUnitWithZeroExponent(assertEvals) {
  assertEvals(`Pa*m in N`, `1N/m`);
}

export function testOtherDerivedUnits(assertEvals) {
  assertEvals(`Hz in s`, `1/s`);
  assertEvals(`Pa in N/m^2`, `1N/m^2`);
  assertEvals(`Pa in N`, `1N/m^2`);
  assertEvals(`Pa * m2`, `1N`);
  assertEvals(`Pa*m2*1`, `1N`);
  assertEvals(`J in m`, `1m^2*kg/s^2`);
  assertEvals(`J / m`, `1J/m`);
  assertEvals(`W * s`, `1W*s`);
  assertEvals(`C/s`, `1A`);
  assertEvals(`V*A`, `1W`);
  // Current approach doesn't simplify to these:
  // assertEvals(`J / m`, `1N`);
  // assertEvals(`W * s`, `1N*m`);
  // assertEvals(`J in m`, `1m*N`);
  // assertEvals(`W * s`, `1J`);
}

export function docs() {
  return `
### Derived units
# TBD
`;
}

let derivedUnits = {};
Object.values(measures).forEach(({ units }) => {
  derivedUnits = { ...derivedUnits, ...units };
});

export const measure = { name: "derived", units: derivedUnits };
