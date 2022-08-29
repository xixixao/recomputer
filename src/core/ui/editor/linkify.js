import { syntaxTree } from "@codemirror/language";
import { Decoration, ViewPlugin } from "@codemirror/view";
import { Term } from "../../parser/terms";

export const linkify = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = this.getMarks(view);
    }
    update(update) {
      if (update.docChanged) {
        this.decorations = this.getMarks(update.view);
      }
    }
    getMarks(view) {
      const ast = syntaxTree(view.state);
      const marks = [];
      const doc = view.state.doc;

      ast.iterate({
        enter: (type, from, to) => {
          switch (type.id) {
            case Term.URL: {
              const href = doc.sliceString(from, to);
              marks.push(
                Decoration.mark({
                  tagName: "a",
                  attributes: {
                    href,
                    // TODO: This makes links hard to edit but is
                    // a quick UX win
                    contenteditable: "false",
                  },
                }).range(from, to)
              );
              return;
            }
            case Term.Assignment:
            case Term.Expression:
              return false;
          }
        },
      });
      return Decoration.set(marks);
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);
