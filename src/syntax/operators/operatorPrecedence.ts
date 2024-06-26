import {
  add,
  convertUnits,
  convertUnits2,
  divide,
  exponentiate,
  multiply,
  root,
  subtract,
} from "./operatorList";

const byPrecedence = [
  [exponentiate, root],
  [multiply, divide],
  [add, subtract],
  [convertUnits, convertUnits2],
];

// From tightest / highest precedence
export const operatorsByPrecedence = byPrecedence.map(
  (operators) =>
    new RegExp("^(" + operators.map(({ regex }) => regex).join("|") + ")")
);

export const implicitOperators = byPrecedence.map((operators) => {
  const implicitOperator = operators.filter(
    (operator) => "implicit" in operator
  )[0];
  // @ts-ignore
  return implicitOperator?.implicit;
});
