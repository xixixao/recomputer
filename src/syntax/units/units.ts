import { textAt } from "../../core/evaluate/astCursor.js";
import { Dictionary } from "../../core/evaluate/Dictionary.js";
import { Units } from "../../core/evaluate/Units.js";
import { Parse } from "../../core/parser/parser.js";
import { Term } from "../../core/parser/terms.js";

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
  assertEvals(`3kg m / (3m)`, `1kg`);
}

export function testMultipleUnits(assertEvals) {
  assertEvals(`1m s`, `1m*s`);
}

export function testAddRates(assertEvals) {
  assertEvals(`1m + 1km`, `1,001m`);
  assertEvals(`1m/s + 1km/s`, `1,001m/s`);
  assertEvals(`2/year + 1/month`, `14 / year`);
  assertEvals(`1/month + 24/year`, `3 / month`);
}

export function testImplicitExponentiate(assertEvals) {
  assertEvals(`1m3`, `1m^3`);
  assertEvals(`2m/s2`, `2m/s^2`);
}

export function testPrintingDenominator(assertEvals) {
  assertEvals(`2/3N/kg2`, `2/3 m/(kg*s^2)`);
}

// @ts-expect-error TODO: Finish this
export function testAccuracy(assertEvals) {
  // assertEvals(`~20m + (~5.0m/s2) (~1.1s)^2`, `26m`);
}

export function testScalarUnits(assertEvals) {
  assertEvals(`sin (0 rad)`, `0`);
  assertEvals(`sin (0 deg)`, `0`);
  assertEvals(`sin (0 m/m)`, `0`);
}

export function docs() {
  return `
### Units
Units can be any of the predefined units which are listed in later sections, or a custom unit which is a single word:
(36 potatoes / year) * 1 month
=3 potatoes
A single digit can be suffixed to a unit for easy exponentiation:
14m2
=14m^2
`;
}
const TERM = Term.Unit;

const INVALID_CHARS = "[+-/*%^=()]";
const VALID_FIRST_CHAR = /\S/.source;
const VALID_END_CHAR = `(${VALID_FIRST_CHAR}|[0-9])`;

const FIRST_CHAR_PATTERN = `(?!${INVALID_CHARS})${VALID_FIRST_CHAR}`;
const MORE_CHARS_PATTERN = `${FIRST_CHAR_PATTERN}((?:(?!${INVALID_CHARS})${VALID_END_CHAR})+)*`;
const UNIT_PATTERN = new RegExp(
  `^(${MORE_CHARS_PATTERN}|${FIRST_CHAR_PATTERN})`
);

export function PredefinedUnit(parse: Parse): boolean {
  parse.startNode();
  if (!parse.matchRegex(parse.config.predefinedUnits)) {
    return parse.endNode();
  }
  return parse.addNode(Term.Unit);
}

export function Unit(parse: Parse): boolean {
  parse.startNode();
  if (!parse.matchRegex(UNIT_PATTERN)) {
    return parse.endNode();
  }
  return parse.addNode(Term.Unit);
}

export function PrefixUnit(parse: Parse): boolean {
  parse.startNode();
  if (!parse.matchRegex(parse.config.prefixes)) {
    return parse.endNode();
  }
  return parse.addNode(Term.Unit);
}

export function evaluateUnit() {
  return {
    node: TERM,
    evaluate: (state) => {
      const text = textAt(state);
      const [symbol, exponent] = computeUnitExponent(text);
      const [prefixSymbol, prefixUnit, symbolWithoutPrefix, unit] =
        computeUnitPrefix(state, symbol);
      const symbolSingular = getSingularSymbol(symbolWithoutPrefix, unit);
      return Units.fromUnit(
        symbolSingular,
        unit,
        exponent,
        prefixSymbol,
        prefixUnit
      );
    },
  };
}

function computeUnitExponent(text) {
  const exponentMatch = text.match(/^(.*)([1-9])$/);
  const [_, symbol, exponentText] = exponentMatch ?? ["", text, "1"];
  const exponent = +exponentText;
  return [symbol, exponent];
}

function getSingularSymbol(symbol, unit) {
  if (unit == null) {
    return symbol;
  }
  const definedSingular = unit.pluralToSingular.get(symbol);
  if (definedSingular != null) {
    return definedSingular;
  }
  return symbol;
}

function computeUnitPrefix(state, symbolWithPrefix) {
  const unit = lookupUnit(state, symbolWithPrefix);
  if (unit == null) {
    const prefixSymbol = state.measures.prefixDictionary.search(
      0,
      (i) => symbolWithPrefix[i]
    );
    if (prefixSymbol != null) {
      const symbol = symbolWithPrefix.slice(prefixSymbol?.length ?? 0);
      const unit = lookupUnit(state, symbol);
      if (unit != null) {
        return [
          prefixSymbol,
          state.measures.prefixLookup.get(prefixSymbol),
          symbol,
          unit,
        ];
      }
    }
  }
  return [null, null, symbolWithPrefix, unit];
}

function lookupUnit(state, symbol) {
  const unitName = state.measures.symbolToUnitName.get(symbol);
  return state.measures.unitNameToUnit.get(unitName);
}

const SET = new Set();

type Measure = {
  name: string;
  units: Array<{
    name: string;
    prefixes: Array<string>;
    measureName: string;
    prefixSymbols: Set<string>;
    postfixSymbols: Set<string>;
    pluralToSingular: Map<string, string>;
    singularToPlural: Map<string, string>;
  }>;
};

export function prepareUnits(measures: Array<Measure>) {
  const unitNameToUnit = new Map();
  const symbolToUnitName = new Map();
  measures.forEach(({ units }) => {
    Object.values(units).forEach((unit) => {
      unitNameToUnit.set(unit.name, unit);
      (unit.prefixSymbols ?? SET).forEach((symbol) => {
        symbolToUnitName.set(symbol, unit.name);
      });
      (unit.postfixSymbols ?? SET).forEach((symbol) => {
        symbolToUnitName.set(symbol, unit.name);
      });
    });
  });

  const prefixLookup = new Map();
  const magnitude = measures.find((measure) => measure.name === "magnitude")!;
  Object.values(magnitude.units).forEach((unit) =>
    unit.prefixes.forEach((prefix) => {
      prefixLookup.set(prefix, unit);
    })
  );

  const prefixDictionary = new Dictionary();
  [0, 1].forEach((i) => {
    Object.values(magnitude.units).forEach((unit) => {
      prefixDictionary.add(unit.prefixes[i], 0);
    });
  });
  return { unitNameToUnit, symbolToUnitName, prefixDictionary, prefixLookup };
}
