import { StateField, StateEffect } from "@codemirror/state";
import { EditorView, Decoration } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import * as Term from "../../parser/parser.terms";
import { highlightLineEffect } from "./highlightEditorActiveLine";
import { shouldForceEvaluate } from "../../editor/forceEvaluate";
import { forEachLine } from "../../evaluate/astCursor";

let resultsContentCache = null;

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

    const resultsContent = [];

    processAst({
      ast,
      doc: editorDoc,
      onEveryLine: (from, lineNumber) => {
        resultsContent[lineNumber] = "";
      },
      onEveryStatement: (from, lineNumber) => {
        const value = getValue.byPos(from);
        if (value != null && value !== "") {
          resultsContent[lineNumber] = value;
        }
      },
    });
    resultsContentCache = resultsContent;
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

    // const editorViewportFrom = editorView.viewport.from;

    const startLine = resultsDoc.line(
      1
      // TODO: Consider only updating viewport
      // Math.max(
      //   Math.min(resultsDoc.lines, editorDoc.lineAt(editorViewportFrom).number),
      //   resultsDoc.lineAt(resultsView.viewport.from).number
      // )
    );
    const startLineNumber = startLine.number;
    changes = [];
    let lineNumber = startLineNumber;
    for (; resultsContentCache[lineNumber] != null; lineNumber++) {
      const currentResultLine = resultsDoc.line(
        Math.min(lineNumber, resultsDoc.lines)
      );
      const shouldAddNewline =
        resultsContentCache[lineNumber + 1] != null &&
        resultsDoc.lines <= lineNumber;
      const newResult = resultsContentCache[lineNumber];
      if (newResult !== currentResultLine.text || shouldAddNewline) {
        const text = newResult + (shouldAddNewline ? "\n" : "");
        changes.push({
          from: currentResultLine.from,
          to: currentResultLine.to,
          insert: text,
        });
      }
    }
    if (resultsDoc.lines >= lineNumber) {
      changes.push({
        from: Math.max(0, resultsDoc.line(lineNumber).from - 1),
        to: resultsDoc.length,
      });
    }
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

function processAst({ ast, doc, onEveryLine = noop, onEveryStatement = noop }) {
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
        onEveryStatement(from, lineNumber - 1);
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
    onEveryLine(doc.length, lineNumber);
  }
}

function lineHeightForPos(view, pos) {
  const line = view.visualLineAt(pos);
  return Math.floor(line.height / view.defaultLineHeight);
}

const lineHeightEffect = StateEffect.define();

const lineNumberToHeight = StateField.define({
  create: () => {
    return {};
  },
  update: stateFieldUpdateFromEffect(lineHeightEffect),
});

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

function stateFieldUpdateFromEffect(syncEffect) {
  return (value, transaction) => {
    for (const effect of transaction.effects) {
      if (effect.is(syncEffect)) {
        return effect.value;
      }
    }
    return value;
  };
}
