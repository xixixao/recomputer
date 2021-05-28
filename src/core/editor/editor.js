import { EditorState, Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultTabBinding } from "@codemirror/commands";
import { language } from "../parser/language";
import {
  resultDisplay,
  resultLineAdjustment,
} from "../ui/editor/resultDisplay";
import { resultTransform } from "../ui/editor/resultTransform";
import { editorStyles, resultsStyles } from "../ui/editor/styles";
import { evaluator, editorParser, resultsParser } from "./config";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
} from "../../storage/localStorage";
import { editorInputOverride } from "./commands";
import { highlightedLines } from "../ui/editor/highlightEditorActiveLine";
import { currency } from "../evaluate/measures";
import { forceEvaluateAnnotation } from "./forceEvaluate";
import { docs } from "../docs";
import { linkify } from "../ui/editor/linkify";
import { test } from "../tests";
import { editorBasics } from "./editorBasics";
import { syncEditorFocusToResultDisplay } from "./syncFocus";

const urlParams = new URL(document.location).searchParams;
const forceWelcome =
  urlParams.get("welcome") != null && urlParams.get("empty") == null;

if (import.meta.env.NODE_ENV !== "production") {
  const shouldTest = urlParams.get("test") != null;

  if (shouldTest) {
    test();
  }
}

let views = {};

currency.onReady = () => {
  views.editor.dispatch({
    annotations: forceEvaluateAnnotation.of(true),
  });
};

views.editor = new EditorView({
  state: EditorState.create({
    doc: forceWelcome ? docs : loadFromLocalStorage(),
    extensions: [
      keymap.of([editorInputOverride, defaultTabBinding]),
      editorBasics,
      EditorView.lineWrapping,
      Prec.fallback(linkify),
      editorStyles(),
      language(editorParser),
      EditorView.updateListener.of(resultDisplay(evaluator, views)),
      EditorView.updateListener.of(saveToLocalStorage),
      EditorView.updateListener.of(syncEditorFocusToResultDisplay(views)),
    ],
  }),
  parent: document.getElementById("leftPane"),
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
  parent: document.getElementById("rightPane"),
});
