import {assertEvals} from "../core/assert.js";
export function test() {
  assertEvals(`1`, `1`);
  assertEvals(`90071992547409919292`, `90071992547409919292`);
  assertEvals(`-90071992547409919292`, `-90071992547409919292`);
  assertEvals(`1 + 1`, `2`);
}
