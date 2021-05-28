import { modules } from "../../modules";

export function flattenModules(modules) {
  const result = {};
  for (const [name, module] of Object.entries(modules)) {
    result[name] = module;
    if (module.modules != null) {
      for (const [name, nestedModule] of Object.entries(module.modules)) {
        result[name] = nestedModule;
      }
    }
  }
  return result;
}

export function getModuleMethods(prefix) {
  const pattern = new RegExp(`^${prefix}(?:[A-Z]|$)`);
  return Object.values(modules).flatMap((module) =>
    Object.entries(module)
      .filter(([name]) => pattern.test(name))
      .map(([_, method]) => method)
  );
}
