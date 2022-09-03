import * as operators from "../../syntax/operators/operatorList";
import { Operator } from "./operatorDeclaration";

export const floatOperators = Object.values(operators).filter(
  (operator) => "f" in operator
) as unknown as Array<
  Operator<(left: unknown) => {}> & { f: (value: number) => number }
>;
