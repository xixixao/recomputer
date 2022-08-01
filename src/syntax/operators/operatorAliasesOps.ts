import { declare } from "./operatorDeclaration";
import { sqrt, sqrt2 } from "./operatorList";

export const AliasesOps = [declare(sqrt2, (a, evaluate) => evaluate(sqrt, a))];
