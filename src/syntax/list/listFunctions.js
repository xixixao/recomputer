import { BigNum } from "../../core/evaluate/BigNum";
import { Value } from "../../core/evaluate/Value";
import { add } from "../operators/operatorList";
import { List } from "./list";

export const sum = {
  symbol: "sum",
  docs: "The total sum of all values.",
  example: "sum(xs)",
  apply: (list) => {
    if (!(list instanceof List)) {
      return null;
    }
    let result = Value.zero();
    list.array.forEach((value) => {
      result = Value.applyBinary(add, result, value);
    });
    return result;
  },
};

export const average = {
  symbol: "avg",
  docs: "The total mean average of values.",
  example: "avg(xs)",
  apply: (list) => {
    const total = sum.apply(list);
    if (total == null) {
      return null;
    }
    return total.divide(
      Value.fromNumber(BigNum.fromInteger(list.array.length))
    );
  },
};
