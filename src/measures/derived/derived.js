import { prepareMeasure } from "../../core/evaluate/measures";
import { Units } from "../../core/evaluate/Units";
import { measure as mass } from "../mass/mass";
import { measure as magnitude } from "../magnitude/magnitude";
import { measure as length } from "../length/length";
import { measure as time } from "../time/time";

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
}

export function testOtherDerivedUnits(assertEvals) {
  assertEvals(`Hz in s`, `1/s`);
}

export function docs() {
  return `
### Derived units
# TBD
`;
}

export const measure = prepareMeasure({
  name: "derived",
  units: {
    newton: {
      postfixSymbols: ["N", ["newton", "newtons"]],
      definition: Units.fromUnit(
        "g",
        mass.units.gram,
        1,
        "k",
        magnitude.units.thousand
      )
        .multiply(Units.fromUnit("m", length.units.meter))
        .multiply(Units.fromUnit("s", time.units.second, -2)),
    },
    hertz: {
      postfixSymbols: ["Hz", "hertz"],
      definition: Units.fromUnit("s", time.units.second, -1),
    },
  },
});
