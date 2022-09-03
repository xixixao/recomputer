import { floatOperators } from "../../syntax/operators/floatOperators";
import { declare, Operator } from "../../syntax/operators/operatorDeclaration";
import {
  add,
  divide,
  exponentiate,
  multiply,
  subtract,
} from "../../syntax/operators/operatorList";
import { BigNum } from "./BigNum";
import { canConvertToFloat } from "./floatable";
import { FloatNum } from "./FloatNum";

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
  ...floatOperators.map((operator) =>
    declare(operator, (a, evaluate) => {
      if (!(a instanceof BigNum)) {
        return null;
      }
      return evaluate(operator, new FloatNum(a.toFloat()));
    })
  ),
];

function convertToFloats(operator: Operator<typeof add.template>) {
  return declare(operator, (a, b, evaluate) => {
    if (a instanceof FloatNum === b instanceof FloatNum) {
      return null;
    }
    if (a instanceof FloatNum && canConvertToFloat(b)) {
      return evaluate(operator, a, new FloatNum(b.toFloat()));
    }
    if (b instanceof FloatNum && canConvertToFloat(a)) {
      return evaluate(operator, new FloatNum(a.toFloat()), b);
    }
    return null;
  });
}
