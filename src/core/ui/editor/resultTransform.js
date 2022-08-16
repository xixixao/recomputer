import { syntaxTree } from "@codemirror/language";
import { Decoration, ViewPlugin, WidgetType } from "@codemirror/view";

export const resultTransform = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = transforms(view);
    }

    update(update) {
      if (update.docChanged || update.viewportChanged)
        this.decorations = transforms(update.view);
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

function transforms(view) {
  let marks = [];
  const ast = syntaxTree(view.state);
  ast.iterate({
    enter: (type, from, to) => {
      switch (type.name) {
        case "Number": {
          const text = view.state.doc.sliceString(from, to);
          if (text.includes("E")) {
            marks.push(
              Decoration.mark({
                class: "expOp",
              }).range(from, to)
            );
            const [_, number, exponent] = text.match(/(.*)E(.*)/);
            marks.push(
              Decoration.widget({
                widget: new Span(
                  number + "×10" + "<sup>" + exponent + "</sup>"
                ),
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
              const cursor = ast.resolve(from).cursor;
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
  constructor(content) {
    super();
    this.content = content;
  }

  eq(other) {
    return other.content == this.content;
  }

  toDOM() {
    let wrap = document.createElement("span");
    wrap.innerHTML = this.content;
    return wrap;
  }
}
