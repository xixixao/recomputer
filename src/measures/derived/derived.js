import { prepareMeasure } from "../../core/evaluate/measures";
import { Units } from "../../core/evaluate/Units";
import { measure as mass } from "../mass/mass";
import { measure as magnitude } from "../magnitude/magnitude";
import { measure as length } from "../length/length";
import { measure as time } from "../time/time";

export function testDerivedUnits(assertEvals) {
  assertEvals(`N / (mg/s2)`);
  assertEvals(`N / kg`);
  assertEvals(`N * kg`);
  assertEvals(`L / m`);
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
  },
});
