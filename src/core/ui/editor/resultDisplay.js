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
  let changes = null;
  let effects = null;
  let ast = null;
  const hasContentChanged =
    update.docChanged || !views.isInitialized || shouldForceEvaluate(update);
  if (hasContentChanged) {
    views.isInitialized = true;
    ast = syntaxTree(editorView.state);
    const cursor = ast.cursor();
    const getValue = evaluator({ doc: editorDoc, cursor });

    const erasePreviousResults = { from: 0, to: resultsDoc.length };
    changes = [erasePreviousResults];
    // let lineNumber = 1;

    processAst({
      ast,
      doc: editorDoc,
      onEveryLine: (from, lineNumber) => {
        if (lineNumber > 1) {
          changes.push({ from: 0, insert: "\n" });
        }
      },
      onLastEmptyLine: () => {
        changes.push({ from: 0, insert: "\n" });
      },
      onEveryStatement: (from) => {
        const value = getValue.byPos(from);
        if (value != null && value !== "") {
          changes.push({ from: 0, insert: value });
        }
      },
    });
  }
  if (hasContentChanged || update.geometryChanged || update.viewportChanged) {
    ast ??= syntaxTree(editorView.state);
    const lineNumberToHeight = [];
    processAst({
      ast,
      doc: editorDoc,
      onEveryLine: (from, lineNumber) => {
        const lineHeight = lineHeightForPos(editorView, from);
        if (lineHeight > 1) {
          lineNumberToHeight[lineNumber] = lineHeight;
        }
      },
    });
    effects = lineHeightEffect.of(lineNumberToHeight);
  }
  if (changes != null || effects != null) {
    views.results.dispatch({ changes, effects });
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

const noop = () => {};

function processAst({
  ast,
  doc,
  onEveryLine = noop,
  onEveryStatement = noop,
  onLastEmptyLine = noop,
}) {
  let lineNumber = 1;
  const handleLine = (state) => {
    const { cursor } = state;
    const from = cursor.from;
    switch (cursor.type.id) {
      case Term.Comment:
      case Term.BlankLine:
      case Term.Statement: {
        onEveryLine(from, lineNumber);
        lineNumber++;
      }
    }
    switch (cursor.type.id) {
      case Term.Statement: {
        onEveryStatement(from);
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
  if (doc.sliceString(doc.length - 1) === "\n") {
    onLastEmptyLine();
  }
}

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
