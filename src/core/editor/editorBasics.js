import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/closebrackets";
import { defaultKeymap } from "@codemirror/commands";
import { commentKeymap } from "@codemirror/comment";
import { defaultHighlightStyle } from "@codemirror/highlight";
import { history, historyKeymap } from "@codemirror/history";
import { indentOnInput } from "@codemirror/language";
import { lintKeymap } from "@codemirror/lint";
import { bracketMatching } from "@codemirror/matchbrackets";
import { rectangularSelection } from "@codemirror/rectangular-selection";
import { searchKeymap } from "@codemirror/search";
import { EditorState } from "@codemirror/state";
import {
  highlightActiveLine,
  highlightSpecialChars,
  keymap,
} from "@codemirror/view";
import { drawBetterSelection } from "./drawBetterSelection";

export const editorBasics = [
  highlightSpecialChars(),
  history(),
  drawBetterSelection(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  defaultHighlightStyle.fallback,
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  highlightActiveLine(),
  keymap.of([
    ...closeBracketsKeymap,
    // Fixed in latest codemirror
    ...defaultKeymap.filter(({ mac }) => mac != "Alt-v"),
    ...searchKeymap,
    ...historyKeymap,
    ...commentKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
];
