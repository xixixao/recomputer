import * as Term from "../parser/parser.terms";

export function textAt({ doc, cursor }) {
  return doc.sliceString(cursor.from, cursor.to);
}

const noop = () => {};
export function forEachStatement(
  state,
  onEveryStatement,
  onEveryComment = noop
) {
  forEachLine(state, (state) => {
    const { cursor } = state;
    if (isComment(cursor)) {
      onEveryComment();
      return;
    }
    cursor.firstChild();
    onEveryStatement(state);
    cursor.parent();
  });
}

export function forEachLine(state, onEveryLine) {
  const cursor = state.cursor;
  cursor.firstChild();
  do {
    if (cursor.type.id !== 0) {
      onEveryLine(state);
    }
  } while (cursor.nextSibling());
  cursor.parent();
}

function isComment(cursor) {
  switch (cursor.type.id) {
    case Term.Comment:
    case Term.BlankLine:
      return true;
  }
  return false;
}
