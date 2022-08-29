import { measures } from "../../measures/measures";
import { constants } from "../../syntax/constants/constants";
import { LIST_SYMBOL } from "../../syntax/list/list";
import * as listFunctions from "../../syntax/list/listFunctions";
import * as operators from "../../syntax/operators/operatorList";
import {
  implicitOperators,
  operatorsByPrecedence,
} from "../../syntax/operators/operatorPrecedence";
import { LAST_RESULT_SYMBOL } from "../../syntax/preceding/preceding";
import { evaluateDocument } from "../evaluate/evaluate";
import { configuredParser } from "../parser/language";

const operatorList = Object.values(operators).concat(
  Object.values(listFunctions)
);

const parserConfig = {
  // Prefixes need to be treated differently from names, because
  // postfix units can be exponentiated, so "m3" is "m^3", but "$3" is "3 $"
  prefixes: measures
    .map(({ units }) =>
      Object.values(units)
        .map((unit) => Array.from(unit.prefixSymbols))
        .flat()
    )
    .flat()
    // TODO: Push this to config
    .map((symbol) => symbol.replace("$", "\\$"))
    // TODO: Figure out how also treat "√" ala prefix but also as a function
    .concat("~"),
  names: operatorList
    .filter((operator) => operator.regex == null)
    .map((operator) => operator.symbol)
    .concat([LAST_RESULT_SYMBOL, LIST_SYMBOL])
    .concat(Array.from(constants().keys())),
  operators: operatorList
    .filter((operator) => operator.regex != null)
    .map((operator) => operator.regex),
  operatorsByPrecedence,
  implicitOperators,
};

export const editorParser = configuredParser({
  ...parserConfig,
  shouldAnalyzeForNames: true,
});
export const resultsParser = configuredParser({
  ...parserConfig,
  shouldAnalyzeForNames: false,
});

export const evaluator = evaluateDocument(operatorList, measures);
