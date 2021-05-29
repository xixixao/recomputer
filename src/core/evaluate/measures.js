export function prepareAsyncMeasure(config) {
  const mutable = {
    ...prepareMeasure(config, function use() {
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

export function prepareMeasure({ name, units }, use) {
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
