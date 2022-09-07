import { flattenModules } from "./core/modules/moduleTransforms";
import * as keyboard from "./keyboard/keyboard";
import * as measures from "./measures/measures";
import * as syntax from "./syntax/syntax";
import * as welcome from "./welcome/welcome";

export const modules = flattenModules({
  welcome,
  syntax,
  measures,
  keyboard,
});
