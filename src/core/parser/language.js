import { defineLanguageFacet, Language } from "@codemirror/language";
import { NodeProp } from "@lezer/common";
import { styleTags, tags as t } from "@lezer/highlight";
import { MyParser } from "./newParser";
// import { parser } from "./parser";
import {
  commentStartTID,
  commentStartTokenizer,
  commentTID,
  commentTokenizer,
  expressionTID,
  expressionTokenizer,
  nameTID,
  nameTokenizer,
} from "./tokens";

import { commentStyleTags } from "../../syntax/comments/comments";

const languageDataProp = new NodeProp();

export function language(parser) {
  const languageData = {
    commentTokens: { line: "#" },
  };
  let data = defineLanguageFacet(languageData);

  return new Language(
    data,
    parser
    // new MyParser(
    // languageDataProp.add((type) => (type.isTop ? data : undefined))
    // )
  );

  // return new LanguageSupport(
  //   new Language()
  //   LRLanguage.define({
  //     parser,
  //     languageData: {
  //       commentTokens: { line: "#" },
  //     },
  //   }),
  //   []
  // );
}

export const configuredParser = (tokenConfig) => {
  return new MyParser(tokenConfig);
};

export const configuredParserOLD = (tokenConfig) => {
  const p = {} /* parser */
    .configure({
      props: [
        styleTags({
          ...commentStyleTags,
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
    // TODO: The signature completely changed so analyzePass is broken
    p.startParse = function (input, fragments, ranges) {
      // TODO: Fix
      // this.firstPassResult = analyzePass(
      //   input,
      //   // startPos,
      //   // context,
      //   this,
      //   tokenConfig
      // );

      // TODO: Reenable incremental parsing my properly tagging tokenizers
      // as contextual
      // const { fragments: _, ...nonIncrementalContext } = context;
      return p.bareStartParse.call(
        this,
        input,
        fragments,
        ranges
        // startPos,
        // nonIncrementalContext
      );
    };
  }
  return p;
};
