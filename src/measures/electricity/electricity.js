import { prepareMeasure } from "../../core/evaluate/measures";

export function testElectricMeasure(assertEvals) {
  assertEvals(`3A`, `3A`);
}

export function docs() {
  return `
### Electricty
# Electric current:
3A
=3A
`;
}

export const measure = prepareMeasure({
  name: "electricCurrent",
  units: {
    ampere: {
      postfixSymbols: ["A", ["ampere", "amperes"]],
      baseUnitValue: 1,
    },
  },
});
