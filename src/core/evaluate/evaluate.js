import { forEachStatement, textAt } from "./astCursor";
import * as Term from "../parser/parser.terms";
import { evaluateNumber } from "../../syntax/numbers/numbers";
import {
  evaluateBinaryExpression,
  prepareOperators,
} from "../../syntax/operators/operators";
import { evaluateUnit, prepareUnits } from "../../syntax/units/units";
import { evaluateReference } from "../../syntax/names/names";

export const evaluateDocument = (operators, measures) => {
  const operatorLookup = prepareOperators(operators);
  const measureLookup = prepareUnits(measures);

  return ({ doc, cursor }) => {
    const state = {
      operators: operatorLookup,
      measures: measureLookup,
      doc,
      cursor,
      results: new Map(),
      values: new Map(),
    };

    forEachStatement(state, evaluateStatement);
    return {
      byPos: (from) => state.results.get(from)?.toString(),
      byName: (name) => state.values.get(name)?.toString(),
    };
  };
};

function evaluateStatement(state) {
  const { cursor } = state;

  const statementPos = cursor.from;

  cursor.nextSibling();
  if (cursor.type.id === Term.NestedStatements) {
    forEachStatement(state, evaluateStatement);
  }
  cursor.prevSibling();
  // console.log("statement", cursor.name, textAt(state));

  switch (cursor.type.id) {
    case Term.Expression: {
      cursor.firstChild();
      const value = evaluateExpression(state);
      state.values.set("_", value);
      state.results.set(statementPos, value);
      cursor.parent();
      return;
    }
    case Term.Assignment: {
      cursor.firstChild();
      const name = textAt(state);
      cursor.nextSibling();
      const value = evaluateExpression(state);
      state.values.set(name, value);
      state.results.set(statementPos, value);
      cursor.parent();
      return;
    }
  }
}

const expressionEvaluatorsByNodeID = new Map(
  [
    evaluateNumber(),
    evaluateBinaryExpression(),
    evaluateUnit(),
    evaluateReference(),
    evaluateParens(),
  ].map(({ node, evaluate }) => [node, evaluate])
);

export function evaluateExpression(state) {
  const { cursor } = state;
  // console.log("expression", cursor.name, textAt(state));
  const evaluate = expressionEvaluatorsByNodeID.get(cursor.type.id);
  if (evaluate != null) {
    return evaluate(state);
  }
}

function evaluateParens() {
  return {
    node: Term.Parens,
    evaluate: (state) => {
      const { cursor } = state;
      let value = null;
      if (cursor.firstChild()) {
        value = evaluateExpression(state);
        cursor.parent();
      }
      return value;
    },
  };
}
