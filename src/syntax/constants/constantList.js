import { BigNum } from "../../core/evaluate/BigNum";
import { Value } from "../../core/evaluate/Value";

export const PI = {
  symbol: "PI",
  value: Value.fromNumber(BigNum.fromNumber(Math.PI, true)),
};

export const PI2 = {
  symbol: "π",
  value: PI.value,
};

export const E = {
  symbol: "e",
  value: Value.fromNumber(BigNum.fromNumber(Math.E, true)),
};
