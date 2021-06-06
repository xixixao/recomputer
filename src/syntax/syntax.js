import * as names from "./names/names";
import * as preceding from "./preceding/preceding";
import * as numbers from "./numbers/numbers";
import * as comments from "./comments/comments";
import * as units from "./units/units";
import * as operators from "./operators/operators";
import * as nesting from "./nesting/nesting";
import * as list from "./list/list";

export function docs() {
  return `
## Syntax
`;
}

export const modules = {
  names,
  preceding,
  numbers,
  units,
  comments,
  nesting,
  operators,
  list,
};
