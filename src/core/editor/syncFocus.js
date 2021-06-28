export const resultsFocusClass = "editorFucused";

export function syncEditorFocusToResultDisplay(views) {
  return (update) => {
    const editorDom = views.editor.dom;
    const resultsDom = views.results.dom;
    if (
      !update?.focusChanged &&
      resultsDom.classList.contains(resultsFocusClass) ===
        editorDom.classList.contains("cm-focused")
    ) {
      return;
    }
    views.results.dom.classList.toggle(
      resultsFocusClass,
      update?.view?.hasFocus || editorDom.classList.contains("cm-focused")
    );
  };
}
