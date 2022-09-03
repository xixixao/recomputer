import { BigNumOps } from "../../core/evaluate/BigNumOps";
import { FloatBigNumsOps } from "../../core/evaluate/FloatBigNumsOps";
import { FloatOps } from "../../core/evaluate/FloatOps";
import { SigFloatOps } from "../../core/evaluate/SigFloatOps";
import { ValueOps } from "../../core/evaluate/ValueOps";
import { ListOps } from "../list/ListOps";
import { AliasesOps } from "./operatorAliasesOps";

// TODO move this to the right module
const declarationLookup = new Map();
[]
  .concat(
    BigNumOps,
    FloatOps,
    FloatBigNumsOps,
    SigFloatOps,
    ValueOps,
    AliasesOps,
    ListOps
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
    console.error("Unknown operator", operator);
    return null;
  }
  for (let declaration of declarationList) {
    const result = declaration(...args, evaluateOperator);
    if (result != null) {
      return result;
    }
  }
  // TODO: Error
  console.error("Could not evaluate", operator, args);
  return null;
}
