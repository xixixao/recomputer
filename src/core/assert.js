import { stringInput } from "lezer-tree";
import { LAST_RESULT_SYMBOL } from "../syntax/preceding/preceding";
import { editorParser, evaluator } from "./editor/config";
import { stringToDoc } from "./parser/language";

export function assertEvals(docString, result) {
  try {
    // console.warn(`Expecting ${result}`);
    const ast = editorParser.parse(stringInput(docString));
    let cursor = ast.cursor();
    let getValue = evaluator({ doc: stringToDoc(docString), cursor });
    const value = getValue.byName(LAST_RESULT_SYMBOL);
    if (value !== result) {
      throw new Error(
        `Test failed, expected \`${result}\` but got \`${value}\``
      );
    }
  } catch (error) {
    console.error(docString);
    throw error;
  }
}
