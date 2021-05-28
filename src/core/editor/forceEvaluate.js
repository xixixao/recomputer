import { Annotation } from "@codemirror/state";

export function shouldForceEvaluate(update) {
  return update.transactions[0]?.annotation(forceEvaluateAnnotation);
}

export const forceEvaluateAnnotation = Annotation.define();
