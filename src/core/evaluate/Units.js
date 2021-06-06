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
    return Value.fromUnit(
      new Units([
        Units.compound(symbol, unit, exponent, prefixSymbol, prefixUnit),
      ])
    );
  }

  static compound(symbol, unit, exponent, prefixSymbol, prefixUnit) {
    return {
      symbol,
      unit: unit ?? { measureName: symbol },
      prefix:
        prefixSymbol != null
          ? { symbol: prefixSymbol, unit: prefixUnit }
          : null,
      exponent: exponent ?? 1,
    };
  }

  static fromCompounds(compounds) {
    return Value.fromUnit(new Units(compounds));
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
function UnitsValue(compounds, initialScalar) {
  // Mutated throughout
  let scalar = initialScalar ?? BigNum.one();
  // Handle approx symbol
  const nonApproximate = compounds.filter((compound) => {
    if (compound.symbol === "~") {
      scalar = scalar.toApproximate();
      return false;
    }
    return true;
  });
  // Optimize simple compounds
  if (nonApproximate.length <= 1) {
    return Value.from(scalar, new Units(nonApproximate));
  }
  // Expand derived units
  // const expandedCompounds = [];
  compounds.forEach((compound) => expandDefinition(compound));
  const expandedCompounds = compounds.map((compound) =>
    compound.unit.definition != null ? { ...compound, exponent: 0 } : compound
  );
  compounds.forEach((compound) => {
    // expandedCompounds.push(
    //   compound.unit.definition != null ? { ...compound, exponent: 0 } : compound
    // );
    if (
      compound.unit.exponent !== 0 &&
      compound.unit.expandedDefinition != null
    ) {
      // TODO: I'm not handling scalars in definitions
      expandedCompounds.push(
        ...compound.unit.expandedDefinition.unit.compounds.map(
          ({ required: _, exponent, ...childCompound }) => ({
            ...childCompound,
            fromDerived: true,
            exponent: exponent * compound.exponent,
          })
        )
      );
    }
  });
  // Normalize
  // Compounds in this array are mutated by `combineCompounds`
  const normalizedCompounds = [];
  expandedCompounds.forEach((compound) => {
    let combinationScalar = null;
    for (const modelCompound of normalizedCompounds) {
      combinationScalar = combineCompounds(modelCompound, compound);
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

  // Recombine derived units
  normalizedCompounds.forEach((compound, index) => {
    if (compound.unit.expandedDefinition != null) {
      let combinationScalar = recombineDerivedCompound(
        compound,
        normalizedCompounds,
        index
      );
      if (combinationScalar != null) {
        scalar = scalar.multiply(combinationScalar);
      }
    }
  });
  // Clean up unused derived sub units
  const cleanedNormalizedCompounds = normalizedCompounds.filter(
    (compound) => compound.exponent !== 0 || !compound.fromDerived
  );
  if (
    cleanedNormalizedCompounds.some(
      (compound) => compound.required && compound.exponent === 0
    )
  ) {
    return null;
  }
  return Value.from(scalar, new Units(cleanedNormalizedCompounds));
}

function expandDefinition(compound) {
  if (
    compound.unit.exponent !== 0 &&
    compound.unit.definition != null &&
    compound.unit.expandedDefinition == null
  ) {
    const expandedCompounds = [];
    collectCompounds(compound, 1, expandedCompounds);
    // TODO: I'm not handling scalars in definitions
    compound.unit.expandedDefinition = Units.fromCompounds(expandedCompounds);
  }
}
function collectCompounds(compound, parentExponent, expandedCompounds) {
  compound.unit.definition.unit.compounds.forEach(
    ({ exponent, ...childCompound }) => {
      const isDerived = childCompound.unit.definition != null;
      expandedCompounds.push({
        ...childCompound,
        fromDerived: true,
        exponent: isDerived ? 0 : exponent * parentExponent,
      });
    }
  );
  compound.unit.definition.unit.compounds.forEach(
    ({ exponent, ...childCompound }) => {
      const isDerived = childCompound.unit.definition != null;

      if (isDerived) {
        collectCompounds(
          childCompound,
          exponent * parentExponent,
          expandedCompounds
        );
        expandDefinition(childCompound);
      }
    }
  );
}

function combineCompounds(model, compound) {
  model?.unit?.use != null ? model.unit.use() : 0;

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
  const unitConversion = convertUnitValues(model, compound, exponentConversion);
  const prefixConversion = convertPrefixes(model, compound, exponentConversion);
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

function convertUnitValues(model, compound, exponentConversion) {
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
      .exponentiate(BigNum.fromInteger(compound.exponent))
      .divide(
        BigNum.fromNumber(
          model.unit.baseUnitValue,
          model.unit.baseUnitValueApproximate
        ).exponentiate(BigNum.fromInteger(exponentConversion))
      );
  }
  return BigNum.one();
}

function convertPrefixes(model, compound, exponentConversion) {
  if (
    model != null &&
    model.prefix?.symbol != compound.prefix?.symbol &&
    (model.prefix?.symbol != null || compound.prefix?.symbol)
  ) {
    const conversionBase10 =
      (compound.prefix?.unit.base10 ?? 0) * compound.exponent -
      (model.prefix?.unit.base10 ?? 0) * exponentConversion;
    return BigNum.fromInteger(10).exponentiate(
      BigNum.fromInteger(conversionBase10)
    );
  }
  return BigNum.one();
}

function recombineDerivedCompound(derivedCompound, compounds, _index) {
  // First find the exponent for the derived unit
  let maxExponents = Infinity;
  let exponentsSign = null;
  const modelCompounds = derivedCompound.unit.expandedDefinition.unit.compounds;
  for (const model of modelCompounds) {
    if (model.unit.definition != null) {
      continue;
    }
    let filled = false;
    for (let i = /* index + 1 */ 0; i < compounds.length; i++) {
      const compound = compounds[i];
      if (model.unit.name !== compound.unit.name) {
        continue;
      }
      const exponent = Math.floor(compound.exponent / model.exponent);
      if (!derivedCompound.required && exponent === 0) {
        continue;
      }
      const exponentRemainder = compound.exponent % model.exponent;
      if (
        !derivedCompound.required &&
        exponentRemainder === 0 &&
        compound.required
      ) {
        continue;
      }
      const exponentSign = Math.sign(exponent);
      if (
        !derivedCompound.required &&
        exponentsSign != null &&
        exponentsSign !== exponentSign
      ) {
        continue;
      }
      if (exponentsSign == null) {
        exponentsSign = exponentSign;
      }
      maxExponents = Math.min(maxExponents, Math.max(1, Math.abs(exponent)));
      filled = true;
      break;
    }
    if (!filled) {
      return null;
    }
  }

  const derivedExponent = maxExponents * exponentsSign;
  let scalar = BigNum.one();
  derivedCompound.exponent += derivedExponent;
  for (const model of modelCompounds) {
    for (let i = /* index + 1 */ 0; i < compounds.length; i++) {
      const compound = compounds[i];
      if (compound.unit.name === model.unit.name) {
        compound.exponent -= derivedExponent * model.exponent;
        scalar = scalar.multiply(
          convertPrefixes(model, compound, derivedExponent)
        );
        break;
      }
    }
  }
  return scalar;
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
  const positiveExponent = Math.abs(exponent);
  const unitString = `${longGap}${prefix != null ? prefix.symbol : ""}${
    // TODO: Proper pluralization, using cldr-json at least for time
    position.isNumerator && !isSingle && plural != null ? plural : symbol
  }${positiveExponent > 1 ? `^${positiveExponent}` : ""}`;
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
