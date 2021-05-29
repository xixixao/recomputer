export const decimalSeparator = Intl.NumberFormat(window.navigator.locale)
  .formatToParts(0.1)
  .filter(({ type }) => type === "decimal")[0].value;
export const groupSeparator = decimalSeparator === "." ? "," : ".";
