import { BigNum } from "../../core/evaluate/BigNum";
import { evaluateOperator } from "../operators/evaluateOperator";
import { add } from "../operators/operatorList";
import { sum } from "./listFunctions";

export function testList(assertEvals) {
  assertEvals(
    `3
4
5
__
`,
    `sum 12`
  );
  assertEvals(
    `3
4
5
x = __
`,
    `sum 12`
  );
  assertEvals(
    `3
4
5
sum __
`,
    `12`
  );
  assertEvals(
    `3
4
5
avg __
`,
    `4`
  );
}

export function docs() {
  return `
### Lists
# There is basic support for computing totals and other functions over a series of values. To refer to the preceding list of values, use the \`__\` (two underscores) symbol:
1
2
3
__

x = __
\t1
\t2
\t3
avg x`;
}

export const LIST_SYMBOL = "__";

export function addToList(state, value) {
  if (value == null || value instanceof List) {
    return;
  }
  const list = state.values.get(LIST_SYMBOL) ?? new List([]);
  list.array.push(value);
  state.values.set(LIST_SYMBOL, list);
}

export function maybeResetList(state, name) {
  if (name == null || name == LIST_SYMBOL) {
    const list = state.values.get(name);
    state.values.set(LIST_SYMBOL, null);
    return list;
  }
  return null;
}

export class List {
  constructor(array) {
    this.array = array;
  }

  toDisplayString() {
    const string = this.sum().toDisplayString();
    return string != null ? `sum ${string}` : null;
  }

  toValue() {
    return sum.apply(this);
  }

  sum() {
    let result = BigNum.zero();
    this.array.forEach((value) => {
      result = evaluateOperator(add, result, value);
    });
    return result;
  }
}
