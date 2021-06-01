import { prepareMeasure } from "../../core/evaluate/measures";

export function testLengthMeasure(assertEvals) {
  assertEvals(`1 foot in m`, `0.3048m`);
  assertEvals(`1 acre in m2`, `4,046.8564224m^2`);
  assertEvals(`1000m2 in km2`, `0.001km^2`);
  assertEvals(`1l in m3`, `0.001m^3`);
  assertEvals(`1000cm3 in m3`, `0.001m^3`);
  assertEvals(`1000cm3 in m`, `0.001m^3`);
  assertEvals(`L/m`, `1L/m`);
  assertEvals(`L/dm in dm2`, `1dm^2`);
  assertEvals(`L in dm in dm3`, `1dm^3`);
}

export function docs() {
  return `
### Length, Area, Volume
# Meters, ares, litres and imperial units (inches, feet, yards, miles, acres, teaspoons, tablespoons, fluid-ounces, cups, pints, quarts and gallons) are supported:
~10m + 2 inches + 3ft + 4yd + 5mi
~10ha + 5ac
~10l + 5L + 1tsp + 2tbsp + 3floz + 3 cups + 1pt + 1qt + 1gal
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
    litre: {
      postfixSymbols: ["l", "L", ["litre", "litres"], ["liter", "liters"]],
      baseUnitValue: 0.001,
      baseUnitExponent: 3,
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
    teaSpoon: {
      postfixSymbols: ["tsp", ["teaspoon", "teaspoons"]],
      baseUnitValue: 0.00000492892159375,
      baseUnitExponent: 3,
    },
    tableSpoon: {
      postfixSymbols: ["Tbsp", "tbsp", ["tablespoon", "tablespoons"]],
      baseUnitValue: 0.00001478676478125,
      baseUnitExponent: 3,
    },
    fluidOunce: {
      postfixSymbols: ["floz", ["fluidounce", "fluidounces"]],
      baseUnitValue: 0.0000295735295625,
      baseUnitExponent: 3,
    },
    cup: {
      postfixSymbols: [["cup", "cups"]],
      baseUnitValue: 0.0002365882365,
      baseUnitExponent: 3,
    },
    pint: {
      postfixSymbols: ["pt", ["pint", "pints"]],
      baseUnitValue: 0.000473176473,
      baseUnitExponent: 3,
    },
    quart: {
      postfixSymbols: ["qt", ["quart", "quarts"]],
      baseUnitValue: 0.000946352946,
      baseUnitExponent: 3,
    },
    gallon: {
      postfixSymbols: ["gal", ["gallon", "gallons"]],
      baseUnitValue: 0.003785411784,
      baseUnitExponent: 3,
    },
  },
});
