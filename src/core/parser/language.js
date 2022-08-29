import { defineLanguageFacet, Language } from "@codemirror/language";
import { NodeProp } from "@lezer/common";
import { MyParser } from "./parser";
// import { parser } from "./parser";

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
