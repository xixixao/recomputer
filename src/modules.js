import { flattenModules } from "./core/modules/moduleTransforms";
import * as welcome from "./welcome/welcome";
import * as syntax from "./syntax/syntax";
import * as measures from "./measures/measures";

export const modules = flattenModules({
  welcome,
  syntax,
  measures,
});
