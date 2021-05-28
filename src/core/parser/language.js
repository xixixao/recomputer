import { LezerLanguage, LanguageSupport } from "@codemirror/language";
import { styleTags, tags as t } from "@codemirror/highlight";
import {
  expressionTID,
  commentTID,
  commentStartTID,
  nameTID,
  commentTokenizer,
  commentStartTokenizer,
  expressionTokenizer,
  nameTokenizer,
} from "./tokens";
import { parser } from "./parser";

import { analyzeDocument } from "../evaluate/analyze";

export function language(parser) {
  return new LanguageSupport(
    LezerLanguage.define({
      parser,
      languageData: {
        commentTokens: { line: "#" },
      },
    }),
    []
  );
}

export const configuredParser = (tokenConfig) => {
  const p = parser.configure({
    props: [
      styleTags({
        "NormalComment/...": t.lineComment,
        NormalCommentStart: t.docComment,
        "StrongComment/...": t.blockComment,
        Name: t.variableName,
        Reference: t.variableName,
        Number: t.number,
        Unit: t.atom,
        // Boolean: t.bool,
        // String: t.string,
        // "( )": t.paren
      }),

      /// Can support code folding:
      // indentNodeProp.add({
      //   Document: (context) => context.column(context.node.from) + context.unit,
      // }),
      // foldNodeProp.add({
      //   Document: foldInside,
      // }),
    ],
    tokenizers: [
      { from: expressionTID, to: expressionTokenizer(tokenConfig) },
      { from: nameTID, to: nameTokenizer(tokenConfig) },
      { from: commentStartTID, to: commentStartTokenizer(tokenConfig) },
      { from: commentTID, to: commentTokenizer(tokenConfig) },
    ],
  });
  if (tokenConfig.shouldAnalyzeForNames) {
    p.bareParse = p.parse;
    p.bareStartParse = p.startParse;
    p.parse = function (input, startPos, context) {
      this.firstPassResult = analyzePass(
        input,
        startPos,
        context,
        this,
        tokenConfig
      );
      return p.bareParse.call(this, input, startPos, context);
    };
    p.startParse = function (input, startPos, context) {
      this.firstPassResult = analyzePass(
        input,
        startPos,
        context,
        this,
        tokenConfig
      );
      // TODO: Reenable incremental parsing my properly tagging tokenizers
      // as contextual
      const { fragments: _, ...nonIncrementalContext } = context;
      return p.bareStartParse.call(
        this,
        input,
        startPos,
        nonIncrementalContext
      );
    };
  }
  return p;
};

export function stringToDoc(docString) {
  return {
    sliceString(from, to) {
      return docString.substring(from, to);
    },
  };
}

function analyzePass(input, startPos, context, parser, { names }) {
  const ast = parser.bareParse.call(parser, input, startPos, context);
  const docString = input.read(0, input.length);
  const doc = stringToDoc(docString);
  const cursor = ast.cursor();
  return analyzeDocument({ cursor, doc, names });
}
