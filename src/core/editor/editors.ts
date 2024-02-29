import elt from "crelt";
import { examples } from "../../intro/intro";
import { LocalStorage } from "../../storage/localStorage";
import { docs } from "../docs";
import { initializeEditor } from "./editor";

// const urlParams = new URL(document.location).searchParams;
// const shouldForceIntro = urlParams.get("intro") != null;

const storage = LocalStorage.main();
let controlledViews:
  | (ReturnType<typeof initializeEditor> & {
      recomputer: HTMLElement;
    })
  | null = null;

setUpEditorDOM(append, { storage });
setUpFooter();

type Ref = { value: HTMLElement };

function setUpEditorDOM(
  addToDOM: (e: HTMLElement) => void,
  {
    storage,
    closeButton,
    editable,
  }: {
    storage?: LocalStorage;
    closeButton?: (ref: Ref) => HTMLElement;
    editable?: boolean;
  } = {}
) {
  const leftPane = elt("div", { class: "leftPane" });
  const rightPane = elt("div", { class: "rightPane" });
  const recomputerRef: Ref = {} as any;
  recomputerRef.value = elt(
    "div",
    {
      class: "recomputer",
      ...(editable === false ? { style: "pointer-events: none" } : {}),
    },
    [
      leftPane,
      rightPane,
      closeButton != null ? closeButton(recomputerRef) : null,
    ]
  );
  addToDOM(recomputerRef.value);
  const views = initializeEditor(leftPane, rightPane, storage);
  return { ...views, recomputer: recomputerRef.value };
}

function closeButton(recomputerRef: Ref) {
  return elt(
    "button",
    {
      name: "close",
      onclick: () => {
        recomputerRef.value.remove();
      },
      "aria-label": "close",
    },
    ["×"]
  );
}

function onClickShow(text) {
  return () => {
    if (controlledViews != null) {
      controlledViews.recomputer.remove();
    }
    controlledViews = setUpEditorDOM(prepend, { closeButton });
    controlledViews.editor.dispatch({ changes: [{ from: 0, insert: text }] });
  };
}

function setUpFooter() {
  document.getElementById("footer")!.append(
    Link({
      onClick: onClickShow(examples),
      href: "?examples",
      label: "Examples",
    }),
    " ",
    Link({ onClick: onClickShow(docs), href: "?guide", label: "Guide" }),
    " ",
    elt(
      "a",
      { href: "https://github.com/xixixao/recomputer", target: "_blank" },
      ["Github"]
    )
  );
}

function Link({ onClick, href, label }) {
  return elt(
    "a",
    {
      onclick: (event) => {
        if (event.metaKey || event.ctrlKey) {
          return;
        }
        event.preventDefault();
        onClick();
      },
      href,
    },
    [label]
  );
}

function append(element) {
  document.getElementById("wrapper")!.append(element);
}

function prepend(element) {
  document.getElementById("wrapper")!.prepend(element);
}
