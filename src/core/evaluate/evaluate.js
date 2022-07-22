import { constants } from "../../syntax/constants/constants";
import { addToList, maybeResetList } from "../../syntax/list/list";
import { evaluateReference } from "../../syntax/names/names";
import { evaluateNumber } from "../../syntax/numbers/numbers";
import {
  evaluateBinaryExpression,
  prepareOperators,
} from "../../syntax/operators/operators";
import { saveLastResult } from "../../syntax/preceding/preceding";
import { evaluateUnit, prepareUnits } from "../../syntax/units/units";
import * as Term from "../parser/parser.terms";
import { forEachStatement, textAt } from "./astCursor";

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
      values: constants(),
    };

    forEachStatement(state, evaluateStatement, () => maybeResetList(state));
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
  console.log("expression", cursor.name, textAt(state));
  const evaluate = expressionEvaluatorsByNodeID.get(cursor.type.id);
  if (evaluate != null) {
    const value = evaluate(state);
    saveLastResult(state, value);
    addToList(state, value);
    return value;
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
