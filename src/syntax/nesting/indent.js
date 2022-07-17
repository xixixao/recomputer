import { ExternalTokenizer, ContextTracker } from "@lezer/lr";
import * as Token from "../../core/parser/parser.terms.js";

const newline = 10,
  carriageReturn = 13,
  tab = 9;

let cachedIndent = 0,
  cachedInput = null,
  cachedPos = 0;
function getIndent(input, pos) {
  if (pos == cachedPos && input == cachedInput) {
    return cachedIndent;
  }
  cachedInput = input;
  cachedPos = pos;
  return (cachedIndent = getIndentInner(input, pos));
}

function getIndentInner(input, pos) {
  for (let indent = 0; ; pos++) {
    let ch = input.get(pos);
    if (ch == tab) {
      indent += 1;
    } else if (ch == newline || ch == carriageReturn) {
      return -1;
    } else {
      return indent;
    }
  }
}

export const newlines = new ExternalTokenizer(
  (input, token, stack) => {
    return;
    // TODO: Also totally broken by Lezer
    let next = input.get(token.start);
    if (next >= 0 && (next === newline || next === carriageReturn)) {
      const depth = getIndent(input, token.start + 1);
      if (
        (stack.context.depth === 0 && depth < 0) ||
        depth === stack.context.depth
      ) {
        token.accept(Token.newline, token.start + 1);
      }
    }
  },
  { contextual: true, fallback: true }
);

export const indentation = new ExternalTokenizer((input, token, stack) => {
  return;
  // TODO: Also totally broken by Lezer
  let ch = input.get(token.start);
  if (ch != newline && ch != carriageReturn && ch >= 0) {
    return;
  }
  const depth = getIndent(input, token.start + 1);
  const noIndent =
    (stack.context.depth === 0 && depth < 0) || depth === stack.context.depth;
  if (!noIndent) {
    const isDedent = depth < stack.context.depth;
    token.accept(
      isDedent ? Token.dedent : Token.indent,
      isDedent ? token.start : token.start + 1
    );
  }
});

function IndentLevel(parent, depth) {
  this.parent = parent;
  this.depth = depth;
  this.hash =
    (parent ? (parent.hash + parent.hash) << 8 : 0) + depth + (depth << 4);
}

const topIndent = new IndentLevel(null, 0);

export const trackIndent = new ContextTracker({
  start: topIndent,
  shift(context, term, input, stack) {
    return term == Token.indent
      ? new IndentLevel(context, getIndent(input, stack.pos))
      : term == Token.dedent
      ? context.parent
      : context;
  },
  hash(context) {
    return context.hash;
  },
});
