import { BigNum } from "../../core/evaluate/BigNum";
import { declare } from "../operators/operatorDeclaration";
import { divide } from "../operators/operatorList";
import { List } from "./list";
import { average, sum } from "./listFunctions";

export const ListOps = [
  declare(sum, (list) => {
    if (!(list instanceof List)) {
      return null;
    }
    return list.sum();
  }),

  declare(average, (list, evaluate) => {
    if (!(list instanceof List)) {
      return null;
    }
    const total = list.sum();
    if (total == null) {
      return null;
    }
    return evaluate(divide, total, BigNum.fromInteger(list.array.length));
  }),
];
