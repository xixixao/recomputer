import { EditorView } from "@codemirror/basic-setup";
import { tags, HighlightStyle } from "@codemirror/highlight";
import { commentsHighlight } from "../../../syntax/comments/comments";
import { resultsFocusClass } from "../../editor/syncFocus";

export const editorStyles = () => [
  sharedHighlight,
  sharedCodemirrorStyles,
  editorViewStyles,
];
export const resultsStyles = () => [
  sharedHighlight,
  sharedCodemirrorStyles,
  resultsViewStyles,
];

const sharedHighlight = HighlightStyle.define([
  {
    tag: tags.variableName,
    color: "#6bc1fa",
    // textDecoration: "underline",
    // textDecorationColor: "rgba(107, 193, 250, 0.4)",
    // borderRadius: "3px",
    // backgroundColor: "rgba(107, 193, 250, 0.1)",
    // padding: "0 2px",
  },
  { tag: tags.atom, color: "#b6ddf6" },
  ...commentsHighlight,
]);

const textColor = "#e3e3e3";
const fontFamily = `ui-sans-serif,
system-ui,
-system-ui,
-apple-system,
BlinkMacSystemFont,
Roboto, Helvetica, Arial,
sans-serif,
"Apple Color Emoji"`;

const sharedCodemirrorStyles = EditorView.theme(
  {
    // ".cm-result-display": { float: "right" },
    ".cm-scroller": {
      fontFamily,
      lineHeight: "1.8",
    },
    "&.cm-focused": { outline: "none" },
    "&": { color: textColor, fontFamily },
    "& button, & input": { fontFamily },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    ".cm-selectionMatch": {
      backgroundColor: "transparent",
    },
    ".cm-cursor-primary, .cm-cursor-secondary": {
      borderLeftColor: textColor,
    },
    ".cm-activeLine": {
      backgroundColor: "transparent",
    },
    [`&.cm-focused .cm-activeLine, &.${resultsFocusClass} .cm-activeLine`]: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    a: {
      color: "inherit",
      textDecorationColor: "inherit",
    },
    ".cm-panels": {
      backgroundColor: "rgba(41, 41, 44, 0.6)",
      padding: "4px",
      borderRadius: "6px",
    },
    button: {
      color: "white",
    },
    ".cm-panels :focus-visible": {
      outline: "white solid 1px",
    },
  },
  { dark: true }
);
const editorViewStyles = EditorView.theme({
  ".cm-activeLine": {
    borderRadius: "6px 0 0 6px",
  },
  ".cm-line": {
    paddingLeft: "12px",
  },
});
const resultsViewStyles = EditorView.theme({
  "&": {
    textAlign: "right",
  },
  ".expOp": {
    fontSize: 0,
  },
  ".multOp": {
    fontSize: 0,
  },
  sup: {
    verticalAlign: "top",
    position: "relative",
    top: "-0.1rem",
  },
  ".cm-content": {
    overflowX: "hidden",
    minWidth: "0 !important",
  },
  ".cm-line": {
    overflowX: "hidden",
    textOverflow: "ellipsis",
    paddingRight: "12px",
  },
  ".cm-activeLine": {
    borderRadius: "0 6px 6px 0",
  },
});
