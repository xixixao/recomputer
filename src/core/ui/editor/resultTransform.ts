import { syntaxTree } from "@codemirror/language";
import { Range } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";

export const resultTransform = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = transforms(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged)
        this.decorations = transforms(update.view);
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

function transforms(view: EditorView) {
  let marks: Array<Range<Decoration>> = [];
  const ast = syntaxTree(view.state);
  ast.iterate({
    enter: (nodeRef) => {
      const { name, from, to } = nodeRef;
      switch (name) {
        case "Number": {
          const text = view.state.doc.sliceString(from, to);
          if (text.includes("E")) {
            const [number, exponent] = text.split("E");
            const exponentStart = from + number.length;
            marks.push(
              Decoration.mark({
                class: "expOp",
              }).range(exponentStart, to)
            );
            marks.push(
              Decoration.widget({
                widget: new Span("×10" + "<sup>" + exponent + "</sup>"),
              }).range(to)
            );
          }
          break;
        }
        case "ArithOp": {
          const text = view.state.doc.sliceString(from, to);
          switch (text) {
            case "^": {
              marks.push(
                Decoration.mark({
                  class: "expOp",
                }).range(from, to)
              );
              // starts at the parent BinaryExpression
              const cursor = nodeRef.node.cursor();
              cursor.firstChild();
              cursor.nextSibling();
              cursor.nextSibling();
              marks.push(
                Decoration.mark({
                  tagName: "sup",
                }).range(cursor.from, cursor.to)
              );
              break;
            }
            case "*": {
              marks.push(
                Decoration.mark({
                  class: "multOp",
                }).range(from, to)
              );
              marks.push(
                Decoration.widget({
                  widget: new Span("\u00B7"),
                }).range(to)
              );
              break;
            }
          }
        }
      }
    },
  });
  return Decoration.set(marks);
}

class Span extends WidgetType {
  content: string;

  constructor(content: string) {
    super();
    this.content = content;
  }

  eq(other: Span) {
    return other.content == this.content;
  }

  toDOM() {
    let wrap = document.createElement("span");
    wrap.innerHTML = this.content;
    return wrap;
  }
}
