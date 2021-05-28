import { currencyUnits } from "./measures/currencyUnits";

export const magnitude = measure({
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

export const time = measure({
  name: "time",
  units: {
    second: {
      postfixSymbols: ["s", ["second", "seconds"]],
      baseUnitValue: 1,
    },
    minute: {
      postfixSymbols: ["min", ["minute", "minutes"]],
      baseUnitValue: 60,
    },
    hour: {
      postfixSymbols: ["h", ["hour", "hours"]],
      baseUnitValue: 60 * 60,
    },
    day: {
      postfixSymbols: ["d", ["day", "days"]],
      baseUnitValue: 24 * 60 * 60,
    },
    week: {
      postfixSymbols: ["w", ["week", "weeks"]],
      baseUnitValue: 7 * 24 * 60 * 60,
    },
    month: {
      postfixSymbols: ["mo", ["month", "months"]],
      baseUnitValue: 2629746 /*(365.2425 * 24 * 60 * 60) / 12*/,
    },
    year: {
      postfixSymbols: ["y", ["year", "years"]],
      baseUnitValue: 31556952 /*365.2425 * 24 * 60 * 60*/,
    },
  },
});

export const length = measure({
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
  },
});

export const mass = measure({
  name: "mass",
  units: { gram: { postfixSymbols: ["g", ["gram", "grams"]] } },
});

export const temperature = measure({
  name: "temperature",
  units: { kelvin: { postfixSymbols: ["K", "kelvin"] } },
});

const baseCurrency = "usd";
export const currency = asyncMeasure({
  name: "currency",
  units: currencyUnits,
  load: (currency) => {
    return window
      .fetch(
        `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${baseCurrency}.json`
      )
      .then((response) => response.json())
      .then((result) => {
        const units = currency.unitNameToUnit;
        const rates = result[baseCurrency];
        Object.keys(rates).forEach((currency) => {
          const currencyUnit = units.get(currency);
          currencyUnit.baseUnitValue = 1 / rates[currency];
          currencyUnit.baseUnitValueApproximate = true;
        });
      });
  },
});

function asyncMeasure(config) {
  const mutable = {
    ...measure(config, function use() {
      if (mutable.isLoaded || mutable.isLoading) {
        return;
      }
      mutable.isLoading = true;
      config.load(mutable).then(() => {
        mutable.isLoaded = true;
        mutable.onReady();
      });
    }),
    isLoaded: false,
    isLoading: false,
    onReady: null,
  };
  return mutable;
}

function measure({ name, units }, use) {
  const unitNameToUnit = new Map();
  const unitList = [];
  for (const [
    unitName,
    { prefixSymbols, postfixSymbols, symbols, ...unit },
  ] of Object.entries(units)) {
    const prefixes = prefixSymbols ?? symbols ?? [];
    const postfixes = postfixSymbols ?? symbols ?? [];
    const withPlural = prefixes
      .concat(postfixes)
      .filter((symbol) => Array.isArray(symbol));
    const unitWithName = {
      ...unit,
      name: unitName,
      measureName: name,
      prefixSymbols: new Set(prefixes.flat()),
      postfixSymbols: new Set(postfixes.flat()),
      pluralToSingular: new Map(
        withPlural.map(([singular, plural]) => [plural, singular])
      ),
      singularToPlural: new Map(withPlural),
      use,
    };
    unitNameToUnit.set(unitName, unitWithName);
    unitList.push(unitWithName);
  }
  return {
    name,
    unitNameToUnit,
    units: unitList,
  };
}
