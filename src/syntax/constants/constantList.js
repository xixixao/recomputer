import { FloatNum } from "../../core/evaluate/FloatNum";

export const PI = {
  symbol: "PI",
  value: new FloatNum(Math.PI),
};

export const PI2 = {
  symbol: "π",
  value: PI.value,
};

export const E = {
  symbol: "e",
  value: new FloatNum(Math.E),
};

export const TAU = {
  symbol: "τ",
  value: new FloatNum(2 * Math.PI),
};

export const TAU2 = {
  symbol: "TAU",
  value: new FloatNum(2 * Math.PI),
};
