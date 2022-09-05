import { prepareMeasure } from "../../core/evaluate/measures";

export function docs() {
  return `
### Mass
# Grams, tons and imperial units (ounces, pounds, stones, short tons) are supported:
~ oz + lb + st + shortton in kg
=914.01723468kg
150t in Mg
=150Mg
`;
}

export const measure = prepareMeasure({
  name: "mass",
  units: {
    gram: {
      postfixSymbols: ["g", ["gram", "grams"]],
      baseUnitValue: 1,
    },
    ton: {
      postfixSymbols: ["t", ["ton", "tons", "tonne", "tonnes"]],
      baseUnitValue: 1000000,
    },
    ounce: {
      postfixSymbols: ["oz", ["ounce", "ounces"]],
      baseUnitValue: 28.3495,
    },
    pound: {
      postfixSymbols: ["lb", ["pound", "pounds"]],
      baseUnitValue: 453.592,
    },
    stone: {
      postfixSymbols: ["st", ["stone", "stones"]],
      baseUnitValue: 6350.29318,
    },
    shortTon: {
      postfixSymbols: [["shortton", "shorttons"]],
      baseUnitValue: 907185,
    },
  },
});
