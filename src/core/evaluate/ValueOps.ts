import { declare, Evaluate } from "../../syntax/operators/operatorDeclaration";
import {
  add,
  convertUnits,
  divide,
  exponentiate,
  multiply,
  root,
  subtract,
} from "../../syntax/operators/operatorList";
import { BigNum } from "./BigNum";
import { canConvertToFloat } from "./floatable";
import { Units } from "./Units";
import { Value } from "./Value";

export const ValueOps = [
  declare(convertUnits, (a, b, evaluate) => {
    if (!(b instanceof Value)) {
      // TODO: error
      return null;
    }
    const unit = Units.fromCompounds(
      b.unit.compounds
        .filter(({ fromDerived }) => !fromDerived)
        .map((compound) => ({
          ...compound,
          exponent: 0,
          required: true,
        }))
    );
    return evaluate(multiply, unit, a);
  }),

  declareAddLike(add),
  declareAddLike(subtract),

  declareMultiplyLike(multiply),
  declare(multiply, (a, b) => {
    if (!(a instanceof Units && b instanceof Units)) {
      return null;
    }
    return a.multiply(b);
  }),

  // @ts-ignore
  declareMultiplyLike(divide),
  declare(divide, (a, b) => {
    if (!(a instanceof Units && b instanceof Units)) {
      return null;
    }
    return a.divide(b);
  }),

  // TODO: From before we had multiple dispatch, implement:
  //
  // Supported exponentiations
  // integer ^ integer (max 100) => bigger exponents need different
  //                                representation, with approximate flag
  //   float ^ integer (max 100)        ditto
  // integer ^ float             => needs approximation flag if not precise
  //   float ^ float                   ditto
  //    unit ^ integer (max 10)
  //    unit ^ float             => only if unit has a consistent power?
  declare(exponentiate, (a, b, evaluate) => {
    if (!(a instanceof Value)) {
      return null;
    }
    const unitsValue = evaluate(exponentiate, a.unit, b);
    if (unitsValue == null) {
      return null;
    }
    return combine(evaluate(exponentiate, a.number, b), unitsValue, evaluate);
  }),
  declare(exponentiate, (a, b) => {
    if (!(a instanceof Units && canConvertToFloat(b))) {
      return null;
    }
    return a.exponentiate(b.toFloat());
  }),

  declare(root, (a, b, evaluate) => {
    if (!(b instanceof Value)) {
      return null;
    }
    return evaluate(exponentiate, b, evaluate(divide, BigNum.one(), a));
  }),
];

function declareAddLike(operator: typeof add) {
  return declare(operator, (a, b, evaluate) => {
    if (!(a instanceof Value && b instanceof Value)) {
      return null;
    }

    const unitsValue = Value.fromUnit(a.unit);
    const convertedB = evaluate(convertUnits, b, unitsValue);

    // TODO: This can never happen
    if (!(convertedB instanceof Value)) {
      return null;
    }
    if (unitsValue == null) {
      return null;
    }
    const number = evaluate(operator, a.number, convertedB.number);
    if (number == null) {
      return null;
    }
    return combine(number, unitsValue, evaluate);
  });
}

function declareMultiplyLike(operator: typeof multiply) {
  return declare(operator, (a, b, evaluate) => {
    if (!(a instanceof Value || b instanceof Value)) {
      return null;
    }

    const aValue = Value.fromMaybeNumber(a);
    const bValue = Value.fromMaybeNumber(b);
    const unitsValue = evaluate(operator, aValue.unit, bValue.unit);
    if (unitsValue == null) {
      // TODO: error
      return null;
    }
    const number = evaluate(operator, aValue.number, bValue.number);
    if (number == null) {
      // TODO: error
      return null;
    }
    return combine(number, unitsValue, evaluate);
  });
}

function combine(number: any, unitsValue: any, evaluate: Evaluate) {
  const combinedNumber = evaluate(multiply, number, unitsValue.number);
  return new Value(combinedNumber, unitsValue.unit);
}
