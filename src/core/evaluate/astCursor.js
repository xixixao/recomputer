import * as Term from "../parser/parser.terms";

export function textAt({ doc, cursor }) {
  return doc.sliceString(cursor.from, cursor.to);
}

export function forEachStatement(state, fn) {
  forEachLine(state, (state) => {
    const { cursor } = state;
    if (isComment(cursor)) {
      return;
    }
    cursor.firstChild();
    fn(state);
    cursor.parent();
  });
}

export function forEachLine(state, fn) {
  const cursor = state.cursor;
  cursor.firstChild();
  do {
    if (cursor.type.id !== 0) {
      fn(state);
    }
  } while (cursor.nextSibling());
  cursor.parent();
}

function isComment(cursor) {
  switch (cursor.type.id) {
    case Term.Comment:
      return true;
    case Term.BlankLine:
      return true;
  }
  return false;
}
