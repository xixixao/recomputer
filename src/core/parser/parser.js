// This file was generated by lezer-generator. You probably shouldn't edit it.
import { Parser } from "lezer";
import {
  indentation,
  newlines,
  trackIndent,
} from "../../syntax/nesting/indent";
import { commentStartTID, commentTID, expressionTID, nameTID } from "./tokens";
export const parser = Parser.deserialize({
  version: 13,
  states:
    "'OQVQ!}OOOOQ#n'#Ce'#CeOqQaO'#ChO!tQ#mO'#CmOOQ#l'#DP'#DPO#UQPO'#CgO#ZQ#XO'#CoO#iQ#XO'#CpOOQ#S'#Cn'#CnO#wQ#]O'#CfOOQ!|'#Cr'#CrO$VQ!cO'#CrQVQ!}OOO$[QaO,59SOOQ`'#Cj'#CjOOQ`'#Ck'#CkOOQ`'#Cl'#ClO$cQ#mO,59TOqQaO,59TOqQaO,59TOqQaO,59TOqQaO,59TOqQaO,59ROOQ#W'#Cs'#CsO%gQ#XO,59ZO%uQ#XO,59[O&TQ!uO'#CqOOQ#n,59Q,59QO&iQ!cO,59QO&nQ#TO,59QOOQ!|,59^,59^OOQ!|-E6p-E6pOOQ#l1G.n1G.nOOQ#l1G.o1G.oO'eQ#mO1G.oO(OQ#mO1G.oO)ZQ#mO1G.oO)qQ#mO1G.mOOQ#W-E6q-E6qOOQ#f'#Ct'#CtO*RQ#gO,59]OOQ#n1G.l1G.lO*YQ!cO1G.lOOQ#f-E6r-E6rOOQ!b1G.w1G.wOOQ#n7+$W7+$W",
  stateData:
    "*_~OqOS~OPTORVOSSOTSOUSOkUOoPOtQO~OSSOTSOUSOtQO~OSSOTSOUSOVeOl`OtQOv^Ow_Ox_Oy_Oz`O~ORaXkaXmaXoaX~P!POrfO~OQgOjgOocXmcX~OQgOjgOodXmdX~ORVOkUOmjOokO~OonO~OupO~P!POv^OR]aS]aT]aU]aV]ak]al]am]ao]at]aw]ax]ay]az]au]a~OQgOjgOocamca~OQgOjgOodamda~OPTOSSOTSOUSOoPOtQO~OoyO~OmjOoyO~Ov^OR]iV]ik]il]im]io]iz]iu]i~OS]iT]iU]it]iw]ix]iy]i~P&vOSSOTSOUSOtQOw_Ox_Oy_O~P&vOSSOTSOUSOl`OtQOv^Ow_Ox_Oy_Oz`O~OR]iV]ik]im]io]iu]i~P(iORZikZimZioZi~P!POn|O~P&TOo}O~O",
  goto: "$gtPPPPPPPPPuu}!T!T!f!o!v}!|#T#T#Y#`#f#pPPPPPPPPPP#vSYO[TwjxXXO[jxoSOQR[]bcdefjstux_bR]arstuZcR]stuXdR]tuSZO[RmXVWOX[QlXRzmQ[ORo[QhUQiVTvhiQxjR{xWRO[jxQ]QYaR]stuQqbQrcQsdQteRuf",
  nodeNames:
    "⚠ Name URL NormalCommentStart Number Reference Unit BinOp Document BlankLine Statement Assignment Parens BinaryExpression ArithOp ArithOp ArithOp Expression Comment StrongComment NormalComment NestedStatements",
  maxTerm: 42,
  context: trackIndent,
  skippedNodes: [0],
  repeatNodeCount: 3,
  tokenData:
    "!v~RYXYqpqquv|xy!Ryz!Wz{!]{|!b!P!Q!g!_!`!l#Q#R!q~vQq~XYqpqq~!ROy~~!WOt~~!]Ou~~!bOw~~!gOz~~!lOx~~!qOr~~!vOv~",
  tokenizers: [
    0,
    nameTID,
    commentTID,
    commentStartTID,
    expressionTID,
    indentation,
    newlines,
  ],
  topRules: { Document: [0, 8] },
  tokenPrec: 0,
});
