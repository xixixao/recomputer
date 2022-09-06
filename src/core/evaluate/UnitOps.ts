import { declare } from "../../syntax/operators/operatorDeclaration";
import {
  divide,
  exponentiate,
  multiply,
} from "../../syntax/operators/operatorList";
import { canConvertToFloat } from "./floatable";
import { Units, UnitsValue } from "./Units";
import { Value } from "./Value";

export const UnitOps = [
  declare(multiply, (a, b, evaluate) => {
    if (!(a instanceof Units && b instanceof Units)) {
      return null;
    }
    return UnitsValue(a.compounds.concat(b.compounds), evaluate);
  }),

  declare(divide, (a, b, evaluate) => {
    if (!(a instanceof Units && b instanceof Units)) {
      return null;
    }
    return UnitsValue(
      a.compounds.concat(
        b.compounds.map(({ exponent, ...compound }) => ({
          ...compound,
          exponent: -1 * exponent,
        }))
      ),
      evaluate
    );
  }),

  declare(exponentiate, (a, b, evaluate) => {
    if (!(a instanceof Units && canConvertToFloat(b))) {
      return null;
    }
    if (a.isScalar()) {
      return Value.one();
    }
    return UnitsValue(
      a.compounds.map(({ exponent, ...compound }) => ({
        ...compound,
        exponent: exponent * b.toFloat(),
      })),
      evaluate
    );
  }),
];
