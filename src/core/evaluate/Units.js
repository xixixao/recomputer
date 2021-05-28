import { BigNum } from "./BigNum";
import { Value } from "./Value";

export class Units {
  constructor(numerator, denominator) {
    this.numerator = numerator;
    this.denominator = denominator;
  }

  static scalar() {
    return new Units([], []);
  }

  static fromRaw(numerator, denominator) {
    return new Units(numerator, denominator);
  }

  toString(number) {
    const numberOrPartsFromNumerator = this.numerator.reduce(
      (acc, unitSymbol, index) =>
        printUnitValue(acc, unitSymbol, {
          isNumerator: true,
          isFirst: index === 0,
        }),
      number
    );
    const numberOrPartsFromBoth = this.denominator.reduce(
      (acc, unitSymbol, index) =>
        printUnitValue(acc, unitSymbol, {
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

  // static equal(a, b) {
  //   return a.isSameMeasure(b);
  // }

  // isSameMeasure(b) {
  //   // TODO: complicated logic, needs normalized units
  //   // console.log(this.numerator[0], b.numerator);
  //   return (
  //     this.numerator.every(
  //       ({ symbol, unit }, i) =>
  //         symbol === b.numerator[i]?.symbol ||
  //         (unit != null &&
  //           unit.measureName === b.numerator[i]?.unit.measureName)
  //     ) &&
  //     this.denominator.every(
  //       ({ symbol, unit }, i) =>
  //         symbol === b.denominator[i]?.symbol ||
  //         (unit != null &&
  //           unit.measureName === b.denominator[i]?.unit.measureName)
  //     )
  //   );
  // }

  isScalar() {
    const { numerator, denominator } = this;
    return numerator.length === 0 && denominator.length === 0;
  }

  isCurrency() {
    const { numerator, denominator } = this;
    return [numerator, denominator].some((units) =>
      units.some(({ unit }) => unit.measureName === "currency")
    );
  }

  // All methods return Values, not Units below

  static fromUnit(symbol, unit, exponent, prefixSymbol, prefixUnit) {
    // console.log(symbol, unit, prefixSymbol, prefixUnit);
    return UnitsValue(
      [
        {
          symbol,
          unit: unit ?? { measureName: symbol },
          prefix:
            prefixSymbol != null
              ? { symbol: prefixSymbol, unit: prefixUnit }
              : null,
          exponent,
        },
      ],
      []
    );
  }

  multiply(b) {
    const { numerator, denominator } = this;
    return UnitsValue(
      numerator.concat(b.numerator),
      denominator.concat(b.denominator)
    );
  }

  divide(b) {
    const { numerator, denominator } = this;
    return UnitsValue(
      numerator.concat(b.denominator),
      denominator.concat(b.numerator)
    );
  }

  exponentiate(exponent) {
    if (this.isScalar()) {
      return Value.one();
    }
    const exponentInteger = exponent.toInteger();
    if (exponentInteger == null) {
      return null;
    }
    const positiveExponent = Math.abs(exponentInteger);
    const [numerator, denominator] =
      exponentInteger > 0
        ? [this.numerator, this.denominator]
        : [this.denominator, this.numerator];
    return UnitsValue(
      Array(positiveExponent).fill(numerator).flat(),
      Array(positiveExponent).fill(denominator).flat()
    );
  }
}

function UnitsValue(numerator, denominator) {
  const measureNameToUnits = new Map();
  let scalar = processUnitSymbols(
    numerator,
    measureNameToUnits,
    numeratorAddExponent
  ).divide(
    processUnitSymbols(denominator, measureNameToUnits, denominatorAddExponent)
  );
  const normalizedNumerator = [];
  const normalizedDenominator = [];
  for (const units of measureNameToUnits.values()) {
    for (const { symbol, unit, prefix, exponent } of units) {
      if (exponent !== 0) {
        (exponent > 0 ? normalizedNumerator : normalizedDenominator).push({
          symbol,
          unit,
          prefix,
          exponent: Math.abs(exponent),
        });
      }
    }
  }

  return Value.from(
    scalar.inverse(),
    new Units(normalizedNumerator, normalizedDenominator)
  );
}

function numeratorAddExponent(a, b) {
  return a + b;
}

function denominatorAddExponent(a, b) {
  return a - b;
}

// Very mutable algo, so beware!
function processUnitSymbols(units, measureNameToUnits, addExponents) {
  let scalar = BigNum.one();
  units.forEach((unitSymbol) => {
    if (unitSymbol.symbol === "~") {
      scalar = scalar.toApproximate();
      return;
    }
    const { unit } = unitSymbol;
    const measureName = unit.measureName;
    let convertedUnitSymbol = null;
    const modelUnitSymbols = measureNameToUnits.get(measureName) ?? [];
    for (const modelUnitSymbol of modelUnitSymbols) {
      convertedUnitSymbol = convertUnitsAndPrefixes(
        modelUnitSymbol,
        unitSymbol
      );
      if (convertedUnitSymbol != null) {
        scalar = scalar.multiply(convertedUnitSymbol.scale);
        modelUnitSymbol.exponent = addExponents(
          modelUnitSymbol.exponent,
          convertedUnitSymbol.exponent
        );
      }
    }
    if (convertedUnitSymbol == null) {
      measureNameToUnits.set(
        measureName,
        modelUnitSymbols.concat({
          ...unitSymbol,
          exponent: addExponents(0, unitSymbol.exponent),
        })
      );
    }
  });
  return scalar;
}

function convertUnitsAndPrefixes(model, unit) {
  model?.unit?.use != null ? model.unit.use() : 0;
  const exponentConversion = convertUnitExponents(model, unit);
  if (exponentConversion % 1 !== 0) {
    return null;
  }
  const unitConversion = convertUnitSymbols(model, unit);
  const prefixConversion = convertPrefixes(model, unit);
  return {
    scale: unitConversion.multiply(prefixConversion),
    exponent: exponentConversion,
  };
}

function convertUnitExponents(model, unitSymbol) {
  if (
    model != null &&
    model.symbol !== unitSymbol.symbol &&
    (model.unit?.baseUnitExponent != null ||
      unitSymbol.unit?.baseUnitExponent != null)
  ) {
    return (
      (unitSymbol.exponent * (unitSymbol.unit.baseUnitExponent ?? 1)) /
      (model.unit.baseUnitExponent ?? 1)
    );
  }
  return unitSymbol.exponent;
}

function convertUnitSymbols(model, unitSymbol) {
  if (
    model != null &&
    model.symbol !== unitSymbol.symbol &&
    model.unit?.baseUnitValue != null &&
    unitSymbol.unit?.baseUnitValue != null
  ) {
    return BigNum.fromNumber(
      model.unit.baseUnitValue,
      model.unit.baseUnitValueApproximate
    ).divide(
      BigNum.fromNumber(
        unitSymbol.unit.baseUnitValue,
        model.unit.baseUnitValueApproximate
      )
    );
  }
  return BigNum.one();
}

function convertPrefixes(model, unitSymbol) {
  if (
    model != null &&
    model.prefix?.symbol != unitSymbol.prefix?.symbol &&
    (model.prefix?.symbol != null || unitSymbol.prefix?.symbol)
  ) {
    const conversionBase10 =
      (model.prefix?.unit.base10 ?? 0) * model.exponent -
      (unitSymbol.prefix?.unit.base10 ?? 0) * unitSymbol.exponent;
    return BigNum.fromInteger(10).exponentiate(
      BigNum.fromInteger(conversionBase10)
    );
  }
  return BigNum.one();
}

function printUnitValue(valueOrParts, unitSymbol, position) {
  const isStart = position.isNumerator && position.isFirst;
  if (isStart) {
    if (unitSymbol.unit.measureName === "currency") {
      return { numerator: printCurrencyValue(valueOrParts, unitSymbol) };
    }
  }
  const parts =
    valueOrParts instanceof BigNum
      ? valueOrParts.toStringParts()
      : valueOrParts;
  return printUnit(parts, unitSymbol, position);
}

// TODO: Consider that we're ignoring symbol here,
// unlike in other scenarios
function printCurrencyValue(value, unitSymbol) {
  const localizedParts = Intl.NumberFormat(window.navigator.locale, {
    style: "currency",
    currency: unitSymbol.unit.name,
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
