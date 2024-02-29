import { prepareMeasure } from "../../core/evaluate/measures";

export function testMagnitudePrefix(assertEvals) {
  assertEvals(`1km`, `1km`);
  assertEvals(`1km / m`, `1,000`);
  assertEvals(`1 megameter in m`, `1,000,000m`);
}

export function docs() {
  return `
### Prefixes
A metric prefix can be used with any physical measurement unit:
10km
=10km
1ML
=1ML
`;
}

export const measure = prepareMeasure({
  name: "magnitude",
  units: {
    septillion: {
      prefixes: ["yotta", "Y"],
      postfixSymbols: ["septillion"],
      base10: 24,
    },
    sextillion: {
      prefixes: ["zetta", "Z"],
      postfixSymbols: ["sextillion"],
      base10: 21,
    },
    quintillion: {
      prefixes: ["exa", "E"],
      postfixSymbols: ["quintillion"],
      base10: 18,
    },
    quadrillion: {
      prefixes: ["peta", "P"],
      postfixSymbols: ["quadrillion"],
      base10: 15,
    },
    trillion: {
      prefixes: ["tera", "T"],
      postfixSymbols: ["trillion"],
      base10: 12,
    },
    billion: {
      prefixes: ["giga", "G"],
      postfixSymbols: ["billion"],
      base10: 9,
    },
    million: {
      prefixes: ["mega", "M"],
      postfixSymbols: ["M", "million"],
      base10: 6,
    },
    thousand: {
      prefixes: ["kilo", "k"],
      postfixSymbols: ["K", "thousand"],
      base10: 3,
    },
    hundred: {
      prefixes: ["hecto", "h"],
      postfixSymbols: ["hundred"],
      base10: 2,
    },
    ten: {
      prefixes: ["deca", "da"],
      postfixSymbols: ["ten"],
      base10: 1,
    },
    tenth: {
      prefixes: ["deci", "d"],
      postfixSymbols: ["tenth"],
      base10: -1,
    },
    hundredth: {
      prefixes: ["centi", "c"],
      postfixSymbols: ["hundredth"],
      base10: -2,
    },
    thousandth: {
      prefixes: ["milli", "m"],
      postfixSymbols: ["thousandth"],
      base10: -3,
    },
    millionth: {
      prefixes: ["micro", "μ"],
      postfixSymbols: ["millionth"],
      base10: -6,
    },
    billionth: {
      prefixes: ["nano", "n"],
      postfixSymbols: ["billionth"],
      base10: -9,
    },
    trillionth: {
      prefixes: ["pico", "p"],
      postfixSymbols: ["trillionth"],
      base10: -12,
    },
    quadrillionth: {
      prefixes: ["femto", "f"],
      postfixSymbols: ["quadrillionth"],
      base10: -15,
    },
    quintilliont: {
      prefixes: ["atto", "a"],
      postfixSymbols: ["quintilliont"],
      base10: -18,
    },
    sextillionth: {
      prefixes: ["zepto", "z"],
      postfixSymbols: ["sextillionth"],
      base10: -21,
    },
    septillionth: {
      prefixes: ["yocto", "y"],
      postfixSymbols: ["septillionth"],
      base10: -24,
    },
  },
});
