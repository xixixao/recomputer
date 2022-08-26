import {
  Input,
  NodeSet,
  NodeType,
  Parser,
  PartialParse,
  Tree,
  TreeFragment,
} from "@lezer/common";
import { styleTags, tags as t } from "@lezer/highlight";
import { commentStyleTags } from "../../syntax/comments/comments";
import { nameDeclarationPattern } from "../../syntax/names/names";

export class MyParser extends Parser {
  buffer = [];

  createParse(
    input: Input,
    fragments: readonly TreeFragment[],
    ranges: readonly { from: number; to: number }[]
  ): PartialParse {
    if (!input.lineChunks) {
      throw new Error("Expected Input spliced into lines, but it isn't.");
    }
    // console.log("create parse", input.length);
    return {
      advance(): Tree | null {
        const buffer = new Parse(input).toTreeBuffer();
        const tree = buildTree(buffer);
        console.log(buffer);
        // console.log(tree);
        return tree;
      },
      parsedPos: input.length,
      stopAt(pos: number) {
        console.log("stopAt", pos);
      },
      stoppedAt: null,
    };
  }
}

let nodeTypeID = 0;

function newNodeType(name) {
  return NodeType.define({ id: nodeTypeID++, name });
}

// I wouldn't need these names if the highlight package wasn't so uber
// convoluted - this is all super error prone and should be just a plain list
const Err = newNodeType("Err");
const Document = newNodeType("Document");
const BlankLine = newNodeType("BlankLine");
const Comment = newNodeType("Comment");
const StrongComment = newNodeType("StrongComment");
const NormalComment = newNodeType("NormalComment");
const Statement = newNodeType("Statement");
const Name = newNodeType("Name");
const URL = newNodeType("URL");
const Number = newNodeType("Number");
const Reference = newNodeType("Reference");
const Unit = newNodeType("Unit");
const BinOp = newNodeType("BinOp");
const Assignment = newNodeType("Assignment");
const Parens = newNodeType("Parens");
const BinaryExpression = newNodeType("BinaryExpression");
const Expression = newNodeType("Expression");
const NestedStatements = newNodeType("NestedStatements");
const NODE_SET = [
  Err,
  Document,
  BlankLine,
  Comment,
  StrongComment,
  NormalComment,
  Statement,
  Name,
  URL,
  Number,
  Reference,
  Unit,
  BinOp,
  Assignment,
  Parens,
  BinaryExpression,
  Expression,
  NestedStatements,
];
export const Term = Object.entries({
  Err,
  Document,
  BlankLine,
  Comment,
  StrongComment,
  NormalComment,
  Statement,
  Name,
  URL,
  Number,
  Reference,
  Unit,
  BinOp,
  Assignment,
  Parens,
  BinaryExpression,
  Expression,
  NestedStatements,
})
  .map(([name, node]) => [name, node.id])
  .reduce((object, [name, id]) => ({ ...object, [name]: id }), {});

class Parse {
  input: Input;
  pos: number = 0;
  fromPosStack = [0];
  childrenCountStack = [0];
  buffer: Array<number> = [];

  constructor(input: Input) {
    this.input = input;
  }

  toTreeBuffer() {
    this.Document();
    return this.buffer;
  }

  startNode() {
    this.childrenCountStack.push(0);
    this.fromPosStack.push(this.pos);
  }

  endNode(): boolean {
    this.childrenCountStack.pop();
    this.fromPosStack.pop();
    return false;
  }

  // [11, 0, 1, 4, 12, 2, 4, 4, 10, 0, 4, 12]
  addNode(nodeType: NodeType): boolean {
    console.log(nodeType);
    const fromPos = this.fromPosStack.pop()!;
    const numNodes = this.childrenCountStack.pop()! + 1;
    const length = numNodes * 4;
    this.buffer.push(nodeType.id, fromPos, this.pos, length);
    this.childrenCountStack[this.childrenCountStack.length - 1] += numNodes;
    return true;
  }

  Document() {
    // this.startNode();
    this.isAtEnd() || this.BlankLine() || this.Comment() || this.Statement();
    // Lezer's buildTree does this implicitly
    // this.addNode(Document);
  }

  BlankLine(): boolean {
    this.startNode();
    if (!this.match("\n")) {
      return this.endNode();
    }
    return this.addNode(BlankLine);
  }

  Comment(): boolean {
    this.startNode();
    if (!(this.StrongComment() || this.NormalComment())) {
      return this.endNode();
    }
    return this.addNode(Comment);
  }

  StrongComment(): boolean {
    this.startNode();
    if (!this.match("##")) {
      return this.endNode();
    }
    this.consumeRegex(/[^\n]*/);
    return this.addNode(StrongComment);
  }

  NormalComment(): boolean {
    this.startNode();
    if (!this.match("#")) {
      return this.endNode();
    }
    this.startNode();
    this.consumeRegex(/[^\n]*/);
    return this.addNode(NormalComment);
  }

  Statement(): boolean {
    this.startNode();
    this.Assignment() || this.Expression();
    this.Comment();
    // this.NestedStatements();
    // if (!this.newline()) {
    //   throw new Error("Expected newline, error recovery is needed");
    // }
    return this.addNode(Statement);
  }

  Assignment(): boolean {
    this.startNode();
    if (!this.Name()) {
      return this.endNode();
    }
    this.consumeRegex(/ *= */);
    this.expression();
    return this.addNode(Assignment);
  }

  Expression(): boolean {
    this.startNode();
    this.expression();
    return this.addNode(Expression);
  }

  expression(): boolean {
    return (
      this.Reference() ||
      this.Number() ||
      this.Unit() ||
      this.Parens() ||
      this.BinaryExpression()
    );
  }

  Reference(): boolean {
    // TODO: tokenizerReference
    return false;
  }

  Number(): boolean {
    // Disambiguates 3K from 3Kelvin, TODO:
    const symbolsPattern = "\\+|-|\\*|\\/"; //allSymbolsPattern( tokenConfig );
    const numberPattern = new RegExp(
      `^(~?-?\\d(?: (?=\\d)|[.,\\d])*(?:(?:[KM](?=(?:$|\\s|%|${symbolsPattern})))|E-?\\d+)?%?(?:±[.,\\d]+)?)`
    );
    this.startNode();
    if (!this.matchRegex(numberPattern)) {
      return this.endNode();
    }
    return this.addNode(Number);
  }

  Unit(): boolean {
    const VALID_FIRST_CHAR = /\S/.source;
    const VALID_END_CHAR = `(${VALID_FIRST_CHAR}|[0-9])`;
    const allSymbolOr = "\\+|-|\\*|\\/"; //allSymbolsPattern( tokenConfig );

    const first_char_pattern = `(?!${allSymbolOr})${VALID_FIRST_CHAR}`;
    const more_chars_pattern = `${first_char_pattern}((?:(?!${allSymbolOr})${VALID_END_CHAR})+)*`;
    const unitPattern = new RegExp(
      `^(${more_chars_pattern}|${first_char_pattern})`
    );
    this.startNode();
    if (!this.matchRegex(unitPattern)) {
      return this.endNode();
    }
    return this.addNode(Unit);
  }

  Parens(): boolean {
    this.startNode();
    if (!this.match("(")) {
      return this.endNode();
    }
    this.expression();
    return this.addNode(Parens);
  }

  BinaryExpression(): boolean {
    return false;
  }

  Name(): boolean {
    this.startNode();
    if (!this.matchRegex(nameDeclarationPattern)) {
      return this.endNode();
    }
    return this.addNode(Name);
  }

  match(token: string) {
    if (!this.check(token)) {
      return false;
    }
    this.pos += token.length;
    return true;
  }

  matchRegex(token: RegExp) {
    if (this.isAtEnd()) {
      return false;
    }
    const result = this.input.chunk(this.pos).match(token);
    if (result == null) {
      return false;
    }
    const [_, matchedToken] = result;
    this.pos += matchedToken.length;
    return true;
  }

  consumeRegex(token: RegExp) {
    // console.log("pos chunk |" + this.input.chunk(this.pos) + "|");
    const result = this.input.chunk(this.pos).match(token);
    if (result == null) {
      throw new Error("Could not consume, maybe error recovery is needed");
    }
    this.pos += result[0].length;
  }

  private check(token: string) {
    if (this.isAtEnd()) {
      return false;
    }
    return this.peek(token.length) === token;
  }

  private peek(length: number) {
    return this.input.read(this.pos, this.pos + length);
  }

  isAtEnd() {
    return this.pos === this.input.length;
  }
}

// @top Document { (
//   BlankLine |
//   Statement |
//   Comment newline
// )* }

// BlankLine { newline }

// Statement {
//   (
//     Assignment | Expression
//   ) Comment? NestedStatements? newline }

// Assignment { Name "=" expression }

// Expression { expression }

// NestedStatements { indent (BlankLine | Statement)+ dedent }

// expression {
//   Reference |
//   Number |
//   Unit |
//   Parens |
//   BinaryExpression
// }

// Parens { "(" expression ")" }

// @precedence {
//   exp @left
//   mult @left
//   add @left
//   bin @left
//   block @left
// }

// BinaryExpression {
//   expression !exp ArithOp { "^" } expression |
//   expression !mult ArithOp { "*" | "/" | "%" }? expression |
//   expression !add ArithOp { "+" | minus } expression |
//   expression !bin BinOp expression
//   // expression !compare CompareOp expression |
//   // expression !and LogicOp { "&&" } expression |
//   // expression !or LogicOp { "||" } expression
// }

// Comment { StrongComment | NormalComment }

// StrongComment { strongCommentStart (URL | commentContent)* }
// NormalComment { NormalCommentStart (URL | commentContent)* }

// @skip { ws }

// @tokens {
//   ws { $[ \u{9}]+ }
// }

// @external tokens nameTID from "./tokens" { Name }
// @external tokens commentTID from "./tokens" {
//   commentContent,
//   URL
// }
// @external tokens commentStartTID from "./tokens" {
//   strongCommentStart,
//   NormalCommentStart
// }
// @external tokens expressionTID from "./tokens" {
//   Number,
//   Reference,
//   Unit,
//   BinOp,
//   minus
// }

function buildTree(buffer) {
  return Tree.build({
    // buffer: [1, 0, 1, 4, 12, 2, 4, 4, 0, 0, 4, 12],
    buffer,
    nodeSet: new NodeSet(NODE_SET).extend(
      // TODO: Can we get rid of all this complexity and just map class names to
      // NodeTypes?
      styleTags({
        ...commentStyleTags,
        Name: t.variableName,
        Reference: t.variableName,
        Number: t.number,
        Unit: t.atom,
        // Boolean: t.bool,
        // String: t.string,
        // "( )": t.paren
      })
    ),
    topID: Document.id,
  });
}
