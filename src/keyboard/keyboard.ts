export function docs() {
  const validShortcuts = shortcuts
    .filter(({ valid }) => valid())
    .map(({ combos }) => combos)
    .flat();
  if (validShortcuts.length === 0) {
    return ``;
  }
  return (
    `
## Keyboard
# Some useful key combinations:
` + validShortcuts.map((text) => "# " + text).join("\n")
  );
}

// TODO: Power implementation with these
const shortcuts = [
  {
    valid: () => /mac/i.test(window.navigator.platform),
    combos: [
      `Option-P: \`π\``,
      `Option-T: \`τ\``,
      `Option-* (Option-Shift-8): \`°\``,
    ],
  },
];
