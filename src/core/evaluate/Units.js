import { BigNum } from "./BigNum";
import { Value } from "./Value";

// Nomenclature:
//   Measure = length
//   Unit = meter
//   Symbol = m
//   Prefix = thousand
//   Prefix symbol = k
//   Exponent = 3
//   Compound = km^3
//   Units = km^3 s^-2
export class Units {
  constructor(compounds) {
    this.compounds = compounds;
  }

  static scalar() {
    return new Units([]);
  }

  numerator() {
    return this.compounds.filter(({ exponent }) => exponent > 0);
  }

  denominator() {
    return this.compounds.filter(({ exponent }) => exponent < 0);
  }

  visible() {
    return this.compounds.filter(({ exponent }) => exponent !== 0);
  }

  toString(number) {
    const numberOrPartsFromNumerator = this.numerator().reduce(
      (acc, compound, index) =>
        printCompoundValue(acc, compound, {
          isNumerator: true,
          isFirst: index === 0,
        }),
      number
    );
    const numberOrPartsFromBoth = this.denominator().reduce(
      (acc, compound, index) =>
        printCompoundValue(acc, compound, {
          isDenominator: true,
          isFirst: index === 0,
        }),
      numberOrPartsFromNumerator
    );
    const parts =
      numberOrPartsFromBoth instanceof BigNum
        ? numberOrPartsFromBoth.toStringParts()
        : numberOrPartsFromBoth;
    return printParts(parts);
  }

  isScalar() {
    return this.visible().length === 0;
  }

  isCurrency() {
    return this.visible().some(({ unit }) => unit.measureName === "currency");
  }

  // All methods return Values, not Units below

  static fromUnit(symbol, unit, exponent, prefixSymbol, prefixUnit) {
    // console.log(symbol, unit, prefixSymbol, prefixUnit);
    return UnitsValue([
      {
        symbol,
        unit: unit ?? { measureName: symbol },
        prefix:
          prefixSymbol != null
            ? { symbol: prefixSymbol, unit: prefixUnit }
            : null,
        exponent: exponent ?? 1,
      },
    ]);
  }

  multiply(b) {
    return UnitsValue(this.compounds.concat(b.compounds));
  }

  divide(b) {
    return UnitsValue(
      this.compounds.concat(
        b.compounds.map(({ exponent, ...compound }) => ({
          ...compound,
          exponent: -1 * exponent,
        }))
      )
    );
  }

  exponentiate(exponentNum) {
    if (this.isScalar()) {
      return Value.one();
    }
    const exponentInteger = exponentNum.toInteger();
    if (exponentInteger == null) {
      return null;
    }
    return UnitsValue(
      this.compounds.map(({ exponent, ...compound }) => ({
        ...compound,
        exponent: exponent * exponentInteger,
      }))
    );
  }
}

// Very mutable algo, so beware!
function UnitsValue(compounds) {
  // This is mutated
  let normalizedCompounds = [];
  let scalar = BigNum.one();
  compounds.forEach((compound) => {
    if (compound.symbol === "~") {
      scalar = scalar.toApproximate();
      return;
    }

    let combinationScalar = null;
    for (const modelCompound of normalizedCompounds) {
      combinationScalar = combineCompounds(
        modelCompound,
        compound,
        normalizedCompounds
      );
      if (combinationScalar != null) {
        break;
      }
    }
    if (combinationScalar != null) {
      scalar = scalar.multiply(combinationScalar);
    } else {
      normalizedCompounds.push({ ...compound });
    }
  });

  // TODO: Recombine derived units
  return Value.from(scalar, new Units(normalizedCompounds));
}

// This is how L / m3 turns into scalar while
// L / m2 stays the same - because the exponentConversion is 3/2,
// which is not an integer,
// similarly we will want for N / kg to give something valid
// while N * kg will give something invalid,
// but also N / kg if we want m / s2 will need to return additional
// units - so that the resulting array is [N^0, m^1, s^-2],
//                                          ^ this will need to stay
//                                           in the unit Value
//                                           so any later calculation
//                                           uses it. And will
//    need to be handled during printing.
// which should allow (N / kg) * kg
// So basically L (and other simple units like that) are only
// divisible by same exponent, and introduced units always stay, so:
//  L / m2 => [L^1, m^-2]
//  L / m3 => [L^0, m^0]
//  (L / m3) * cm => 0.01*[l^1, m^1]
//  (L / cm3) * m => 0.01*[l^1, cm^1]
//  (L / m3) * cm * m2 => [l^1, m^0]
//  N / kg => [N^0, kg^0, m^1, s^-2]
//  So we will have n^1 and combine it with kg^-1
//  N is defined kg * m * s-2
//    so we will need to try any incoming unit against N and it's definition
//    we might have N * N, which should work like any other unit
//    but if the unit is different, then we need to use the definition
//    then we get non-null set of new units iff any sub-unit has 0 exponent
// N / hz^2 => [N^0, kg^1, m^1, s^0, hz^0]
// # Does this work for all units?
// Go back to L. L definition is m^3.
// L * L => L^2
// L / m
// Different units, so decompose L, m^3 + m^-1,
//  then check if we get ^0,
// we don't (we get m^2), so we keep both, and get
// => [L^1, m^-1]
// N / kg
// Different units, so decompose N, [kg^1, m^1, s^-2],
// combine to get [kg^0, m^1, s^-2], we got 0, we get
// => [N^0, kg^0, m^1, s^-2]
//
// # Handling multiple units
// This is all nice, but it doesn't consider multiple units
// say (N/kg) * kg
// should give N
// we have [N^0, kg^0, m^1, s^-2] and [kg^1]
// which is [N^0, kg^1, m^1, s^-2]
// so for compound units we need to start from left and find combinations
// (L/m^3)m^3 should be [L^0, m^0] and [m^3]
// which should give [L^0, m^3] which then combines to [L^1]
// although this steps is perhaps optional, because (N/kg)*kg ending up
// decomposed is not such a bad deal
function combineCompounds(model, compound, normalizedCompounds) {
  model?.unit?.use != null ? model.unit.use() : 0;
  // TODO: Simple for now
  if (model.unit.measureName !== compound.unit.measureName) {
    return null;
  }

  if (compound.exponent === 0) {
    return BigNum.one();
  }

  const exponentConversion = convertUnitExponents(model, compound);
  if (exponentConversion % 1 !== 0) {
    return null;
  }
  const unitConversion = convertUnitSymbols(
    model,
    compound,
    exponentConversion
  );
  const prefixConversion = convertPrefixes(model, compound);
  model.exponent += exponentConversion;
  return unitConversion.multiply(prefixConversion);
}

function convertUnitExponents(model, compound) {
  if (
    model != null &&
    model.symbol !== compound.symbol &&
    (model.unit?.baseUnitExponent != null ||
      compound.unit?.baseUnitExponent != null)
  ) {
    return (
      (compound.exponent * (compound.unit.baseUnitExponent ?? 1)) /
      (model.unit.baseUnitExponent ?? 1)
    );
  }
  return compound.exponent;
}

function convertUnitSymbols(model, compound, exponent) {
  if (
    model != null &&
    model.symbol !== compound.symbol &&
    model.unit?.baseUnitValue != null &&
    compound.unit?.baseUnitValue != null
  ) {
    return BigNum.fromNumber(
      compound.unit.baseUnitValue,
      compound.unit.baseUnitValueApproximate
    )
      .divide(
        BigNum.fromNumber(
          model.unit.baseUnitValue,
          model.unit.baseUnitValueApproximate
        )
      )
      .exponentiate(BigNum.fromInteger(exponent));
  }
  return BigNum.one();
}

function convertPrefixes(model, compound) {
  if (
    model != null &&
    model.prefix?.symbol != compound.prefix?.symbol &&
    (model.prefix?.symbol != null || compound.prefix?.symbol)
  ) {
    const conversionBase10 =
      (compound.prefix?.unit.base10 ?? 0 - model.prefix?.unit.base10 ?? 0) *
      compound.exponent;
    return BigNum.fromInteger(10).exponentiate(
      BigNum.fromInteger(conversionBase10)
    );
  }
  return BigNum.one();
}

function printCompoundValue(valueOrParts, compound, position) {
  const isStart = position.isNumerator && position.isFirst;
  if (isStart) {
    if (compound.unit.measureName === "currency") {
      return { numerator: printCurrencyValue(valueOrParts, compound) };
    }
  }
  const parts =
    valueOrParts instanceof BigNum
      ? valueOrParts.toStringParts()
      : valueOrParts;
  return printUnit(parts, compound, position);
}

// TODO: Consider that we're ignoring symbol here,
// unlike in other scenarios
function printCurrencyValue(value, compound) {
  const localizedParts = Intl.NumberFormat(window.navigator.locale, {
    style: "currency",
    currency: compound.unit.name,
  }).formatToParts(value.toStringWithoutLocaleFormat());
  const localizedFraction =
    localizedParts
      .find(({ type }) => type === "fraction")
      ?.value.replace(/0+$/, "") ?? "";
  const { fraction, isExact } = value.fractionString();
  const approximationSymbol =
    value.approximate || !isExact || localizedFraction !== (fraction ?? "")
      ? "~"
      : "";

  return (
    approximationSymbol +
    localizedParts.map(({ value }) => value.replace("\u{A0}", " ")).join("")
  );
}

function printUnit(
  { numerator, denominator, isSignular, hasLongUnit },
  { symbol, unit, prefix, exponent },
  position
) {
  const plural = unit.singularToPlural?.get(symbol);
  const isLong =
    plural != null || (unit.singularToPlural == null && symbol.length >= 4);
  const isSingle = isSignular ?? numerator === "1";
  const longGap = position.isNumerator && position.isFirst && isLong ? " " : "";
  const unitString = `${longGap}${prefix != null ? prefix.symbol : ""}${
    // TODO: Proper pluralization, using cldr-json at least for time
    position.isNumerator && !isSingle && plural != null ? plural : symbol
  }${exponent > 1 ? `^${exponent}` : ""}`;
  const multiplySymbol = position.isFirst ? "" : "*";
  return {
    numerator: `${numerator}${
      position.isNumerator ? multiplySymbol + unitString : ""
    }`,
    denominator: `${denominator ?? ""}${
      position.isDenominator ? multiplySymbol + unitString : ""
    }`,
    isSignular: isSingle,
    hasLongUnit: hasLongUnit || isLong,
  };
}

function printParts({ numerator, denominator, hasLongUnit }) {
  if ((denominator ?? "") === "") {
    return numerator;
  }
  const gap = hasLongUnit ? " " : "";
  const divideSymbol = gap + "/" + gap;
  return `${numerator}${divideSymbol}${denominator}`;
}
