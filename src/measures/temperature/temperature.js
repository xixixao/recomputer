import { prepareMeasure } from "../../core/evaluate/measures";

export function docs() {
  return `
### Temperature
# TBD
`;
}
export const measure = prepareMeasure({
  name: "temperature",
  units: { kelvin: { postfixSymbols: ["K", "kelvin"] } },
});
