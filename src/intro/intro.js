import { EditorView } from "@codemirror/view";
import { EditorSelection } from "@codemirror/state";
import { syncEditorFocusToResultDisplay } from "../core/editor/syncFocus";

const INTRO = `## Welcome to Recomputer
# Recomputer is a better, smarter calculator. Let me show you:

`;

const EXAMPLES = [
  `tectonic shift = (0.6 inches / year) * 5K years in meters`,
  `stock = $30K / (4 years) in CZK`,
  `friction = 5N/m`,
];

const OUTRO =
  "# For more information check the links at the bottom of the page. Enjoy!";

export const examples = `## Examples
${EXAMPLES.join("\n\n")}\n\n${OUTRO}`;

export class IntroPlayer {
  constructor(views) {
    this.views = views;
  }

  async play() {
    this.editor = this.views.editor;
    this.editor.dispatch({
      effects: this.views.editable.reconfigure(EditorView.editable.of(false)),
    });
    // Check editor is still in DOM
    await this.delay(0);
    this.eraseAll();
    this.editor.dom.classList.toggle("cm-focused", true);
    syncEditorFocusToResultDisplay(this.views)();

    await this.enter(INTRO);
    await this.delay(2500);
    for (const example of EXAMPLES) {
      await this.typeOut(example);
      await this.delay(500);
      await this.eraseFromEndTo(INTRO);
    }
    await this.delay(500);
    await this.eraseFromEndTo("");
    await this.typeOut(OUTRO);
    await this.delay(1500);
    // await eraseFromEndTo(editor, "");

    this.views.recomputer.remove();

    // views.editor.dom.classList.toggle("animating", false);
  }

  enter(text) {
    let i = this.editor.state.doc.length;
    this.editor.dispatch({
      changes: { from: i, insert: text },
      selection: EditorSelection.cursor(i + text.length),
    });
  }

  async typeOut(text) {
    let head = this.editor.state.doc.length;
    for (const word of text.split(" ")) {
      const isLast = head + word.length === text.length;
      const letterDelay = 200 / Math.max(3, word.length);
      for (const letter of (word + (isLast ? "" : " "))[Symbol.iterator]()) {
        const nextHead = head + letter.length;
        this.editor.dispatch({
          changes: { from: head, insert: letter },
          selection: EditorSelection.cursor(nextHead),
        });
        head = nextHead;
        await this.delay(letterDelay + (letter === "\n" ? 500 : 0));
      }
      await this.delay(50);
    }
  }

  async eraseFromEndTo(text) {
    const docLength = this.editor.state.doc.length;
    this.editor.dispatch({
      selection: EditorSelection.range(docLength, text.length),
    });
    await this.delay(500);
    this.editor.dispatch({
      changes: { from: text.length, to: docLength },
    });
  }

  eraseAll() {
    this.editor.dispatch({
      changes: { from: 0, to: this.editor.state.doc.length },
    });
  }

  delay(durationMs) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        if (this.views.recomputer.isConnected) {
          resolve();
        }
      }, durationMs);
    });
  }
}
