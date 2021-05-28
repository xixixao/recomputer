import { EditorSelection } from "@codemirror/state";

export const editorInputOverride = {
  key: "Space",
  run: (view) => {
    const doc = view.state.doc;
    view.dispatch(
      view.state.changeByRange((range) => {
        const lineBefore = doc.sliceString(
          doc.lineAt(range.from).from,
          range.from
        );
        const insert = /^\t*$/.test(lineBefore) ? "\t" : " ";
        return {
          changes: [{ from: range.from, to: range.to, insert }],
          range: EditorSelection.cursor(range.from + 1),
        };
      })
    );
    return true;
  },
};
