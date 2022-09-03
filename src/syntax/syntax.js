import * as comments from "./comments/comments";
import * as constants from "./constants/constants";
import * as list from "./list/list";
import * as names from "./names/names";
import * as nesting from "./nesting/nesting";
import * as numbers from "./numbers/numbers";
import * as significantFigures from "./numbers/significantFigures";
import * as operators from "./operators/operators";
import * as preceding from "./preceding/preceding";
import * as units from "./units/units";

export function docs() {
  return `
## Syntax
`;
}

export const modules = {
  names,
  preceding,
  numbers,
  significantFigures,
  units,
  comments,
  nesting,
  operators,
  constants,
  list,
};
