import { assertEvals } from "../core/assert";
import { getModuleMethods } from "./modules/moduleTransforms";

export function test() {
  getModuleMethods("test").map((test) => test(assertEvals));
}
