import { stringToDoc } from "./parser/language";
import { evaluator, editorParser } from "./editor/config";
import { stringInput } from "lezer-tree";

export function assertEvals(docString, result) {
  try {
    // console.warn(`Expecting ${result}`);
    const ast = editorParser.parse(stringInput(docString));
    let cursor = ast.cursor();
    let getValue = evaluator({ doc: stringToDoc(docString), cursor });
    const value = getValue.byName("_");
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
