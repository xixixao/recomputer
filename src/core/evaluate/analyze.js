import { textAt, forEachStatement } from "./astCursor";
import * as Term from "../parser/parser.terms";
import { Dictionary } from "./Dictionary";

export const analyzeDocument = ({ doc, cursor, names }) => {
  const state = {
    doc,
    cursor,
    names: new Scopes(new Dictionary(names)),
  };

  forEachStatement(state, analyzeStatement);
  return state.names;
};

function analyzeStatement(state) {
  const { cursor } = state;
  const statementPos = cursor.from;
  switch (cursor.type.id) {
    case Term.Assignment: {
      cursor.firstChild();
      const name = textAt(state);
      state.names.add(name, cursor.to);
      cursor.parent();
    }
  }
  cursor.nextSibling();
  if (cursor.type.id !== Term.NestedStatements) {
    return;
  }
  state.names.startNested(statementPos, cursor.from);
  forEachStatement(state, analyzeStatement);
  state.names.endNested(cursor.to);
}

class Scopes {
  constructor(names) {
    this.scopes = [[{ from: 0, to: Infinity, names }]];
    this.indent = 0;
  }

  add(name, from) {
    this._currentScope().names.add(name, from);
  }

  startNested(at, from) {
    this.indent++;
    if (this.scopes[this.indent] == null) {
      this.scopes[this.indent] = [];
    }
    this.scopes[this.indent].push({ at, from, names: new Dictionary() });
  }

  endNested(to) {
    this._currentScope().to = to;
    this.indent--;
  }

  _currentScope() {
    const scopes = this.scopes[this.indent];
    return scopes[scopes.length - 1];
  }

  cursor() {
    return new ScopesCursor(this.scopes);
  }
}

class ScopesCursor {
  constructor(scopes) {
    this.scopes = scopes;
    this.indices = [0];
  }

  search(indent, at, getCodeUnit, isEnd) {
    let lookInIndent = indent + 1;
    do {
      const scope = this._getScope(lookInIndent, at);
      const pos = lookInIndent === indent + 1 ? Infinity : at;
      const found = scope?.names.search(pos, getCodeUnit);
      if (found != null && isEnd(found.length)) {
        return found;
      }
      lookInIndent--;
    } while (lookInIndent >= 0);
  }

  _getScope(indent, at) {
    if (this.indices[indent] == null) {
      this.indices[indent] = 0;
    }
    let scope = (this.scopes[indent] ?? [])[this.indices[indent]];
    while (scope != null && scope.to < at) {
      this.indices[indent]++;
      scope = this.scopes[indent][this.indices[indent]];
    }
    if (scope != null && scope.at > at) {
      return null;
    }
    return scope;
  }
}
