import { prepareMeasure } from "../../core/evaluate/measures";

export function docs() {
  return `
### Mass
# TBD
`;
}

export const measure = prepareMeasure({
  name: "mass",
  units: { gram: { postfixSymbols: ["g", ["gram", "grams"]] } },
});
