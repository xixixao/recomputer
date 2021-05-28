import { ViewPlugin, Decoration } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";

export const highlightLineEffect = StateEffect.define();

const activeLineHighlighter = ViewPlugin.fromClass(
  class ActiveLineHighlighter {
    constructor(view) {
      this.decorations = this.getDecorations(view);
    }
    update(update) {
      if (
        !isHighlightSame(
          update.startState.field(highlightedLines),
          update.view.state.field(highlightedLines)
        )
      ) {
        this.decorations = this.getDecorations(update.view);
      }
    }
    getDecorations(view) {
      const lineNumbers = view.state.field(highlightedLines);
      if (lineNumbers.length === 0) {
        return Decoration.none;
      }
      const doc = view.state.doc;
      return Decoration.set(
        lineNumbers.map((lineNumber) =>
          lineDeco.range(doc.line(lineNumber).from)
        )
      );
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

export const highlightedLines = StateField.define({
  create() {
    return [];
  },
  update(value, tr) {
    const effect = tr.effects[0];
    if (effect?.is(highlightLineEffect)) {
      return effect.value;
    }
    return value;
  },
  provide: (_field) => activeLineHighlighter,
  compare: isHighlightSame,
});

function isHighlightSame(a, b) {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  return a.every((number, i) => b[i] === number);
}

const lineDeco = Decoration.line({ attributes: { class: "cm-activeLine" } });
