import { prepareMeasure } from "../../core/evaluate/measures";

export function testLengthMeasure(assertEvals) {
  assertEvals(`1 foot in m`, `0.3048m`);
  assertEvals(`1 acre in m2`, `4,046.8564224m^2`);
  assertEvals(`1000m2 in km2`, `0.001km^2`);
  assertEvals(`1l in m3`, `0.001m^3`);
  // Something is wrong, only when the same unit is used
  // with different exponents
  // assertEvals(`1000cm3 in m`, `0.001m^3`);
}

export function docs() {
  return `
### Length, Area, Volume
# Meters, litres and imperial units are supported:
10m + 2 inches in ~ft
10m3 in l
`;
}

export const measure = prepareMeasure({
  name: "length",
  units: {
    meter: {
      postfixSymbols: ["m", ["meter", "meters"], ["metre", "metres"]],
      baseUnitValue: 1,
    },
    are: {
      postfixSymbols: ["a", ["are", "ares"]],
      baseUnitValue: 100,
      baseUnitExponent: 2,
    },
    inch: {
      postfixSymbols: [["inch", "inches"]],
      baseUnitValue: 0.0254,
    },
    foot: {
      postfixSymbols: ["ft", ["foot", "feet"]],
      baseUnitValue: 0.3048,
    },
    yard: {
      postfixSymbols: ["yd", ["yard", "yards"]],
      baseUnitValue: 0.9144,
    },
    mile: {
      postfixSymbols: ["mi", ["mile", "miles"]],
      baseUnitValue: 1609.344,
    },
    acre: {
      postfixSymbols: ["ac", ["acre", "acres"]],
      baseUnitValue: 4046.8564224,
      baseUnitExponent: 2,
    },
    litre: {
      postfixSymbols: ["l", "L", ["litre", "litres"], ["liter", "liters"]],
      baseUnitValue: 0.001,
      baseUnitExponent: 3,
    },
  },
});
