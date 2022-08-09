import { declare, Operator } from "../../syntax/operators/operatorDeclaration";
import {
  add,
  divide,
  exponentiate,
  multiply,
  subtract,
} from "../../syntax/operators/operatorList";
import { BigNum } from "./BigNum";
import { canConvertToFloat, Floatable, FloatNum } from "./FloatNum";

export const FloatBigNumsOps = [
  convertToFloats(add),
  convertToFloats(subtract),
  convertToFloats(multiply),
  convertToFloats(divide),
  convertToFloats(exponentiate),
  // declareAdd(FloatNum, BigNum, floatBig),
  // declareAdd(BigNum, FloatNum, bigFloat),
  // ]
  //   add: binaryOp,
  //   subtract: binaryOp,
  //   multiply: binaryOp,
  //   divide: binaryOp,
  //   exponentiate() {},
];

function convertToFloats(operator: Operator<typeof add.template>) {
  return declare(operator, (a, b, evaluate) => {
    if (a instanceof FloatNum === b instanceof FloatNum) {
      return null;
    }
    if (a instanceof FloatNum && canConvertToFloat(b)) {
      return evaluate(operator, a, b.toFloat());
    }
    if (b instanceof FloatNum && canConvertToFloat(a)) {
      return evaluate(operator, a.toFloat(), b);
    }
    return null;
  });
}
