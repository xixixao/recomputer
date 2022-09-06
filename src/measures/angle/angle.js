import { prepareMeasure } from "../../core/evaluate/measures";

export function testAngleMeasure(assertEvals) {
  assertEvals(`1°`, `1°`);
  assertEvals(`90deg in °`, `90°`);
}

export function docs() {
  return `
### Angle
# Degrees and radians, and converting between them, are supported:
90° to rad
τ rad to degrees
`;
}
export const measure = prepareMeasure({
  name: "angle",
  // Fake unit basically, it can be converted to numbers at any power
  scalar: true,
  units: {
    radian: {
      postfixSymbols: ["rad", ["radian", "radians"]],
      baseUnitValue: 1,
    },
    degree: {
      postfixSymbols: ["deg", "°", ["degree", "degrees"]],
      baseUnitValue: Math.PI / 180,
    },
    turn: {
      postfixSymbols: [["turn", "turns"]],
      baseUnitValue: 2 * Math.PI,
    },
  },
});
