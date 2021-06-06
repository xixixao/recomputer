import { Value } from "../../core/evaluate/Value";
import { add } from "../operators/operatorList";

export const LIST_SYMBOL = "__";

export function addToList(state, value) {
  if (value instanceof List) {
    return;
  }
  const list = state.values.get(LIST_SYMBOL) ?? new List([]);
  list.array.push(value);
  state.values.set(LIST_SYMBOL, list);
}

class List {
  constructor(array) {
    this.array = array;
  }

  toString() {
    return sum(this.array).toString();
  }
}

function sum(array) {
  let result = Value.zero();
  array.forEach((value) => {
    result = Value.applyBinary(add, result, value);
  });
  return result;
}
