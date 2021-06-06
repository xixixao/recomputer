import * as operators from "../../syntax/operators/operatorList";
import { measures } from "../../measures/measures";
import { configuredParser } from "../parser/language";
import { evaluateDocument } from "../evaluate/evaluate";
import { LAST_RESULT_SYMBOL } from "../../syntax/preceding/preceding";
import { LIST_SYMBOL } from "../../syntax/list/list";

const operatorList = Object.values(operators);

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
    .concat("~"),
  names: operatorList
    .filter((operator) => operator.regex == null)
    .map((operator) => operator.symbol)
    .concat([LAST_RESULT_SYMBOL, LIST_SYMBOL]),
  operators: operatorList
    .filter((operator) => operator.regex != null)
    .map((operator) => operator.regex),
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
