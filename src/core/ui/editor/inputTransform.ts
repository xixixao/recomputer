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
import { NodeType, SyntaxNode } from "@lezer/common";
import { Term } from "../../parser/terms";

export const inputTransform = ViewPlugin.fromClass(
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
  let statementMarks: Array<Range<Decoration>> = [];
  ast.iterate({
    enter: (nodeRef) => {
      const { type, from, to, node } = nodeRef;
      const { id } = type;
      switch (id) {
        case Term.Name:
        case Term.Reference:
        case Term.Unit: {
          let text = view.state.doc.sliceString(from, to);
          const tokenLength = text.length;
          const subStart = text.lastIndexOf("_");
          if (subStart > 0 && subStart < tokenLength - 1) {
            const absSubStart = from + subStart;
            marks.push(
              Decoration.mark({
                class: "subStart",
              }).range(absSubStart, absSubStart + 1),
              Decoration.mark({
                class: "sub",
                inclusive: true,
              }).range(absSubStart + 1, to)
            );
          }
          break;
        }
        case Term.BinaryExpression: {
          const firstChild = node.firstChild!;
          const operator = firstChild.nextSibling;
          const firstOperand = lastLeaf(firstChild);
          const secondOperand = firstLeaf(node.lastChild!);
          if (
            firstOperand.type.id === Term.ArithOp ||
            secondOperand.type.id === Term.ArithOp ||
            operator?.type.id === Term.ArithOp
          ) {
            return;
          }
          if (isWord(firstOperand.type) && isWord(secondOperand.type)) {
            statementMarks.push(
              Decoration.replace({
                widget: new Span("\u00B7"),
              }).range(...singleCharRange(firstOperand.to, secondOperand.from))
            );
          }
          break;
        }
        case Term.Statement: {
          pushStatementMarks();
          break;
        }
      }
    },
  });
  pushStatementMarks();
  return Decoration.set(marks);

  function pushStatementMarks() {
    statementMarks.sort((a, b) => a.from - b.from);
    marks.push(...statementMarks);
    statementMarks = [];
  }
}

function firstLeaf(node: SyntaxNode) {
  const cursor = node.cursor();
  while (cursor.firstChild()) {}
  return cursor.node;
}

function lastLeaf(node: SyntaxNode) {
  const cursor = node.cursor();
  while (cursor.lastChild()) {}
  return cursor.node;
}

function isWord(type: NodeType) {
  return type.id === Term.Reference || type.id === Term.Unit;
}

function singleCharRange(from: number, to: number): [number, number] {
  const mid = Math.ceil((to - from) / 2);
  return [from + mid - 1, from + mid];
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
