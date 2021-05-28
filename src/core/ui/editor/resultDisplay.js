import { StateField, StateEffect } from "@codemirror/state";
import { EditorView, Decoration } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import * as Term from "../../parser/parser.terms";
import { highlightLineEffect } from "./highlightEditorActiveLine";
import { shouldForceEvaluate } from "../../editor/forceEvaluate";
import { forEachLine } from "../../evaluate/astCursor";

export const resultDisplay = (evaluator, views) => (update) => {
  const editorView = update.view;
  const editorDoc = editorView.state.doc;
  const resultsView = views.results;
  const resultsDoc = resultsView?.state.doc;
  if (
    update.docChanged ||
    update.geometryChanged ||
    update.viewportChanged ||
    !views.isInitialized ||
    shouldForceEvaluate(update)
  ) {
    views.isInitialized = true;
    const ast = syntaxTree(editorView.state);
    const cursor = ast.cursor();
    const getValue = evaluator({ doc: editorDoc, cursor });

    const erasePreviousResults = { from: 0, to: resultsDoc.length };
    const changes = [erasePreviousResults];
    let lineNumber = 1;
    const lineNumberToHeight = [];
    const handleLine = (state) => {
      const { cursor } = state;
      const from = cursor.from;
      switch (cursor.type.id) {
        case Term.Comment:
        case Term.BlankLine:
        case Term.Statement: {
          if (lineNumber > 1) {
            changes.push({ from: 0, insert: "\n" });
          }
          const lineHeight = lineHeightForPos(editorView, from);
          if (lineHeight > 1) {
            lineNumberToHeight[lineNumber] = lineHeight;
          }
          lineNumber++;
        }
      }
      switch (cursor.type.id) {
        case Term.Statement: {
          const value = getValue.byPos(from);
          if (value != null && value !== "") {
            changes.push({ from: 0, insert: value });
          }
          cursor.firstChild();
          cursor.nextSibling();
          if (cursor.type.id === Term.NestedStatements) {
            forEachLine(state, handleLine);
          }
          cursor.parent();
        }
      }
    };
    forEachLine({ cursor: ast.cursor() }, handleLine);
    if (editorDoc.sliceString(editorDoc.length - 1) === "\n") {
      changes.push({ from: 0, insert: "\n" });
    }
    views.results.dispatch({
      changes,
      effects: lineHeightEffect.of(lineNumberToHeight),
    });
  }
  if (update.selectionSet) {
    const lineNumbers = editorView.state.selection.ranges
      .filter((range) => range.empty)
      .map((range) => editorDoc.lineAt(range.from).number);
    views.results.dispatch({
      effects: highlightLineEffect.of(lineNumbers),
      filter: false,
    });
  }
};

function lineHeightForPos(view, pos) {
  const line = view.visualLineAt(pos);
  return Math.floor(line.height / view.defaultLineHeight);
}

const lineNumberToHeight = StateField.define({
  create: () => {
    return {};
  },
  update(value, tr) {
    const effect = tr.effects[0];
    if (effect?.is(lineHeightEffect)) {
      return effect.value;
    }
    return value;
  },
});

const lineHeightEffect = StateEffect.define();

export function resultLineAdjustment(views) {
  return [
    EditorView.decorations.compute([lineNumberToHeight], (state) => {
      if (views.results == null) {
        return Decoration.none;
      }
      const lineHeights = state.field(lineNumberToHeight);
      return Decoration.set(
        lineHeights
          .map((lineHeight, lineNumber) =>
            Decoration.line({
              attributes: {
                style: `height: ${
                  /* views.results.defaultLineHeight */ 28 * lineHeight
                }px`,
              },
            }).range(state.doc.line(lineNumber).from)
          )
          .filter((lineHeight) => lineHeight != null)
      );
    }),
    lineNumberToHeight.extension,
  ];
}
