import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import { history, historyKeymap } from "@codemirror/commands";
import {
  bracketMatching,
  defaultHighlightStyle,
  indentService,
  indentUnit,
  syntaxHighlighting,
} from "@codemirror/language";
import { lintKeymap } from "@codemirror/lint";
import { searchKeymap } from "@codemirror/search";
import { EditorState } from "@codemirror/state";
import {
  highlightActiveLine,
  highlightSpecialChars,
  keymap,
  rectangularSelection,
} from "@codemirror/view";
import { drawBetterSelection } from "./drawBetterSelection";

export const editorBasics = [
  highlightSpecialChars(),
  history(),
  // drawBetterSelection(),
  EditorState.allowMultipleSelections.of(true),
  indentUnit.of("\t"),
  // Preserves current indent
  indentService.of((context, pos) => context.lineIndent(pos, -1)),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  highlightActiveLine(),
  keymap.of([
    ...closeBracketsKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
];
