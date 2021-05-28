import * as names from "../names/names";
import * as numbers from "../numbers/numbers";
import * as comments from "../comments/comments";
import * as units from "../units/units";
import * as operators from "../operators/operators";
import * as nesting from "../nesting/nesting";

export function docs() {
  return `
# Syntax
`;
}

export const modules = {
  names,
  numbers,
  units,
  comments,
  nesting,
  operators,
};
