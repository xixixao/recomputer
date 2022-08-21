import { assertEvals } from "../core/assert";
import { testDocs } from "./docs";
import { getModuleMethods } from "./modules/moduleTransforms";

export function test() {
  getModuleMethods("test").map((test) => test(assertEvals));
  testDocs(assertEvals);
}
