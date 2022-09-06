import { FloatNum } from "../../core/evaluate/FloatNum";
import { prepareMeasure } from "../../core/evaluate/measures";

export function testAngleMeasure(assertEvals) {
  assertEvals(`1°`, `1°`);
  assertEvals(`90deg in °`, `90°`);
  assertEvals(`360 deg in rad`, `6.283185307179586rad`);
  assertEvals(`τ rad in deg`, `360deg`);
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
      baseUnitValue: new FloatNum(Math.PI / 180),
    },
    turn: {
      postfixSymbols: [["turn", "turns"]],
      baseUnitValue: new FloatNum(2 * Math.PI),
    },
  },
});
