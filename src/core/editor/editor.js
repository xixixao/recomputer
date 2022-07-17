import { defaultTabBinding } from "@codemirror/commands";
import { Compartment, EditorState, Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { measure as currency } from "../../measures/currency/currency";
import { language } from "../parser/language";
import { test } from "../tests";
import { highlightedLines } from "../ui/editor/highlightEditorActiveLine";
import { linkify } from "../ui/editor/linkify";
import {
  resultDisplay,
  resultLineAdjustment,
} from "../ui/editor/resultDisplay";
import { resultTransform } from "../ui/editor/resultTransform";
import { editorStyles, resultsStyles } from "../ui/editor/styles";
import { insertTau, spaceToIndent } from "./commands";
import { editorParser, evaluator, resultsParser } from "./config";
import { editorBasics } from "./editorBasics";
import { forceEvaluateAnnotation } from "./forceEvaluate";
import { syncEditorFocusToResultDisplay } from "./syncFocus";

const urlParams = new URL(document.location).searchParams;
if (import.meta.env.NODE_ENV !== "production") {
  const shouldTest = urlParams.get("test") != null;

  if (shouldTest) {
    test();
  }
}

export function initializeEditor(leftPane, rightPane, storage) {
  let views = {};

  views.editable = new Compartment();

  currency.onReady = () => {
    views.editor.dispatch({
      annotations: forceEvaluateAnnotation.of(true),
    });
  };

  views.editor = new EditorView({
    state: EditorState.create({
      doc: storage != null ? storage.load() : "",
      extensions: [
        keymap.of([spaceToIndent, insertTau, defaultTabBinding]),
        views.editable.of(EditorView.editable.of(true)),
        editorBasics,
        EditorView.lineWrapping,
        Prec.fallback(linkify),
        editorStyles(),
        language(editorParser),
        EditorView.updateListener.of(resultDisplay(evaluator, views)),
        ...(storage != null
          ? [EditorView.updateListener.of((update) => storage.save(update))]
          : []),
        EditorView.updateListener.of(syncEditorFocusToResultDisplay(views)),
      ],
    }),
    parent: leftPane,
  });

  views.results = new EditorView({
    state: EditorState.create({
      doc: "",
      extensions: [
        EditorView.editable.of(false),
        resultsStyles(),
        language(resultsParser),
        highlightedLines.extension,
        resultTransform,
        resultLineAdjustment(views),
      ],
    }),
    parent: rightPane,
  });

  return views;
}
