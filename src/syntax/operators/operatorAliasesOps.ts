import { declare } from "./operatorDeclaration";
import { convertUnits, convertUnits2, sqrt, sqrt2 } from "./operatorList";

export const AliasesOps = [
  declare(sqrt2, (a, evaluate) => evaluate(sqrt, a)),
  declare(convertUnits2, (a, b, evaluate) => evaluate(convertUnits, a, b)),
];
