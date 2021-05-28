export const resultsFocusClass = "editorFucused";

export function syncEditorFocusToResultDisplay(views) {
  return (update) => {
    if (!update.focusChanged) {
      return;
    }
    views.results.dom.classList.toggle(resultsFocusClass, update.view.hasFocus);
  };
}
