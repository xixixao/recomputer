import { ExternalTokenizer } from "@lezer/lr";
import {
  tokenizerCommentContent,
  tokenizerCommentLink,
  tokenizerNormalStart,
  tokenizerStrongStart,
} from "../../syntax/comments/comments";
import {
  tokenizerNameDeclaration,
  tokenizerReference,
} from "../../syntax/names/names";
import { tokenizerMinus, tokenizerNumber } from "../../syntax/numbers/numbers";
import { tokenizerPrefixUnit, tokenizerUnit } from "../../syntax/units/units";
import { Term } from "./terms";

export const nameTID = "name";
export const nameTokenizer = buildLineTokenizer([tokenizerNameDeclaration]);

export const commentStartTID = "commentStart";
export const commentStartTokenizer = buildLineTokenizer([
  tokenizerStrongStart,
  tokenizerNormalStart,
]);

export const commentTID = "comment";
export const commentTokenizer = buildLineTokenizer([
  tokenizerCommentLink,
  tokenizerCommentContent,
]);

const tokenizerBinOp = ({ operators }) => {
  const operatorPattern = new RegExp(`^(${operators.join("|")})`);
  return (line, token) => matchToken(line, operatorPattern, token, Term.BinOp);
};

export const expressionTID = "expression";
export const expressionTokenizer = buildLineTokenizer([
  tokenizerNumber,
  // This needs to be here to have the right precedence vs negative numbers
  tokenizerMinus,
  tokenizerBinOp,
  tokenizerPrefixUnit,
  tokenizerReference,
  tokenizerUnit,
]);

function buildLineTokenizer(tokenizers) {
  return (tokenConfig) => {
    const tokenMatchers = tokenizers.map((tokenizer) => tokenizer(tokenConfig));
    return new ExternalTokenizer((input, stack) => {
      // TODO: @lezer/lr 0.15.0 (2021-08-11) completely broke
      // my usage of this by preventing lookahead and tracking it
      // let pos = token.start;
      // let line = input.lineAfter(pos);
      // for (const matcher of tokenMatchers) {
      //   if (matcher(line, token, stack)) {
      //     return;
      //   }
      // }
    });
  };
}

export function matchToken(line, matcher, token, result) {
  const match = line.match(matcher);
  if (match == null) {
    return false;
  }
  const [_, word] = match;
  token.accept(result, token.start + word.length);
  return true;
}

const OTHER_SYMBOLS = ["=", "\\)", "\\("];
export function allSymbolsPattern({ operators }) {
  return OTHER_SYMBOLS.concat(operators).join("|");
}
