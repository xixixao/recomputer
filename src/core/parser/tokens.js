const OTHER_SYMBOLS = ["=", "\\)", "\\("];
export function allSymbolsPattern({ operators }) {
  return OTHER_SYMBOLS.concat(operators).join("|");
}
