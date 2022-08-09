import { BigNumOps } from "../../core/evaluate/BigNumOps";
import { FloatBigNumsOps } from "../../core/evaluate/FloatBigNumsOps";
import { FloatOps } from "../../core/evaluate/FloatOps";
import { ValueOps } from "../../core/evaluate/ValueOps";
import { ListOps } from "../list/ListOps";
import { AliasesOps } from "./operatorAliasesOps";
import * as operators from "./operatorList";

// TODO move this to the right module
const declarationLookup = new Map();
[]
  .concat(
    BigNumOps,
    FloatOps,
    FloatBigNumsOps,
    ValueOps,
    AliasesOps,
    ListOps,
    Object.values(operators)
      .filter((operator) => operator.declaration != null)
      .map((operator) => operator.declaration)
  )
  .forEach(([operator, declaration]) => {
    const declarationList = declarationLookup.get(operator) ?? [];
    declarationLookup.set(operator, declarationList);
    declarationList.push(declaration);
  });

export function evaluateOperator(operator, ...args) {
  if (args.some((arg) => arg == null)) {
    return null;
  }
  const declarationList = declarationLookup.get(operator);
  if (declarationList == null) {
    // TODO: Error
    return null;
  }
  for (let declaration of declarationList) {
    const result = declaration(...args, evaluateOperator);
    if (result != null) {
      return result;
    }
  }
  // TODO: Error
  return null;
}
