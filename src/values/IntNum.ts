import { assertEvals } from "../core/assert";

export function test() {
  assertEvals(`1`, `1`);
  assertEvals(`90071992547409919292`, `90071992547409919292`);
  assertEvals(`-90071992547409919292`, `-90071992547409919292`);
  assertEvals(`1 + 1`, `2`);
}

// TODO: Do we actually need the BigInt?

// export class IntNum {
//   value: BigInt;

//   constructor(value: BigInt) {
//     this.value = value;
//   }

//   toString(): string {
//     return this.value.toLocaleString();
//   }

//   add(b: FloatNum) {
//     return new FloatNum(this.value + b.value);
//   }

//   subtract(b: FloatNum) {
//     return new FloatNum(this.value - b.value);
//   }

//   multiply(b: FloatNum) {
//     return new FloatNum(this.value * b.value);
//   }

//   divide(b: FloatNum) {
//     return new FloatNum(this.value / b.value);
//   }

//   exponentiate(b: FloatNum) {
//     return new FloatNum(Math.pow(this.value, b.value));
//   }
// }
