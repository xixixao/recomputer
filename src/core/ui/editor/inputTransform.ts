import { syntaxTree } from "@codemirror/language";
import { Range } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { Term } from "../../parser/terms";

export const inputTransform = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = transforms(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged)
        this.decorations = transforms(update.view);
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

function transforms(view: EditorView) {
  let marks: Array<Range<Decoration>> = [];
  const ast = syntaxTree(view.state);
  ast.iterate({
    enter: (nodeRef) => {
      const { type, from, to } = nodeRef;
      const { id } = type;
      switch (id) {
        case Term.Name:
        case Term.Reference:
        case Term.Unit: {
          let text = view.state.doc.sliceString(from, to);
          const tokenLength = text.length;
          const subStart = text.lastIndexOf("_");
          if (subStart > 0 && subStart < tokenLength - 1) {
            const absSubStart = from + subStart;
            marks.push(
              Decoration.mark({
                class: "subStart",
              }).range(absSubStart, absSubStart + 1),
              Decoration.mark({
                class: "sub",
                inclusive: true,
              }).range(absSubStart + 1, to)
            );
          }
          break;
        }
      }
    },
  });
  return Decoration.set(marks);
}
