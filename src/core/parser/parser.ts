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
import {
  Comment,
  DefaultToComment,
  commentStyleTags,
} from "../../syntax/comments/comments";
import { Assignment, Reference } from "../../syntax/names/names";
import { NestedStatements } from "../../syntax/nesting/nesting";
import { Number } from "../../syntax/numbers/numbers";
import { PredefinedUnit, PrefixUnit, Unit } from "../../syntax/units/units";
import { analyzeDocument, Scopes, ScopesCursor } from "../evaluate/analyze";
import { NODE_SET, Term } from "./terms";

type ParserConfig = {
  operators: RegExp;
  prefixes: RegExp;
  predefinedUnits: RegExp;
  names: Array<string>;
  scopes: Scopes | null;
  shouldAnalyzeForNames: boolean;
  operatorsByPrecedence: Array<RegExp>;
  implicitOperators: Array<(parse: Parse) => boolean>;
};

// We currently have to do 2 passes of this parser because we're
// working directly with Lezer trees which enforce that nodes
// are returned in textual order.
// We could move to a single pass if we parsed the nested statements before
// their parents, and either:
//   - produced an actual AST
//   - spliced the parent nodes in correct order into the Lezer tree
export class MyParser extends Parser {
  buffer = [];
  config: ParserConfig;

  constructor(config: ParserConfig) {
    super();
    this.config = config;
  }

  createParse(
    input: Input,
    _fragments: readonly TreeFragment[],
    _ranges: readonly { from: number; to: number }[]
  ): PartialParse {
    if (!input.lineChunks) {
      throw new Error("Expected Input spliced into lines, but it isn't.");
    }
    return {
      advance: (): Tree | null => {
        const config = this.config.shouldAnalyzeForNames
          ? this.analyzeScopes(input)
          : this.config;
        const buffer = new Parse(input, config).toTreeBuffer();
        // console.log(config.scopes);
        // console.log(buffer);
        const tree = buildTree(buffer);
        // console.log(tree);
        return tree;
      },
      parsedPos: input.length,
      stopAt(_pos: number) {
        // console.log("stopAt", pos);
      },
      stoppedAt: null,
    };
  }

  analyzeScopes(input: Input) {
    const buffer = new ScopesParse(input, this.config).toTreeBuffer();
    const tree = buildTree(buffer);
    const scopes = analyzePass(tree, input, this.config);
    return { ...this.config, scopes };
  }
}

export class Parse {
  input: Input;
  config: ParserConfig;
  pos: number = 0;
  fromPosStack = [0];
  childrenCountStack = [0];
  buffer: Array<number> = [];
  indentLevel: number = 0;
  scopesCursor: ScopesCursor | null = null;

  constructor(input: Input, config: ParserConfig) {
    this.input = input;
    this.config = config;
    if (this.config.scopes != null) {
      this.scopesCursor = this.config.scopes.cursor();
    }
  }

  toTreeBuffer() {
    this.Document();
    return this.buffer;
  }

  toScopes() {
    while (!this.isAtEnd()) {
      this.BlankLine() ||
        (Comment(this) && this.requiredNewline()) ||
        this.Statement();
    }
  }

  startNode() {
    this.childrenCountStack.push(0);
    this.fromPosStack.push(this.pos);
  }

  endNode(): boolean {
    const numNodes = this.childrenCountStack.pop()!;
    this.fromPosStack.pop();
    incLast(this.childrenCountStack, numNodes);
    return false;
  }

  addNode(nodeType: NodeType["id"]): boolean {
    const [_, numNodes] = this.writeNode(nodeType);
    incLast(this.childrenCountStack, numNodes);
    return true;
  }

  addNodeAndStartEnclosing(nodeType: NodeType["id"]): boolean {
    const [fromPos, numNodes] = this.writeNode(nodeType);
    // Double up the node
    this.childrenCountStack.push(numNodes);
    this.fromPosStack.push(fromPos);
    return true;
  }

  writeNode(nodeType: NodeType["id"]): [number, number] {
    const fromPos = this.fromPosStack.pop()!;
    const numNodes = this.childrenCountStack.pop()! + 1;
    slog("Node " + NODE_SET[nodeType].name, this.input.read(fromPos, this.pos));
    const length = numNodes * 4;
    this.buffer.push(nodeType, fromPos, this.pos, length);
    return [fromPos, numNodes];
  }

  Document() {
    /// this.startNode();
    while (!this.isAtEnd()) {
      this.BlankLine() ||
        (Comment(this) && this.requiredNewline()) ||
        this.Statement() ||
        DefaultToComment(this);
    }
    /// Lezer's buildTree does this implicitly
    /// this.addNode(Document);
  }

  BlankLine(): boolean {
    this.startNode();
    if (!this.match("\n")) {
      return this.endNode();
    }
    return this.addNode(Term.BlankLine);
  }

  Statement(): boolean {
    this.startNode();
    if (!(Assignment(this) || this.Expression())) {
      return this.endNode();
    }
    // Comment(this);
    NestedStatements(this);
    this.requiredNewline();
    return this.addNode(Term.Statement);
  }

  requiredNewline() {
    if (this.isAtEnd()) {
      return true;
    }
    if (!this.match("\n")) {
      // Skip to end of line
      this.pos += this.input.chunk(this.pos).length;
      this.match("\n");
    }
    return true;
  }

  Expression(): boolean {
    this.startNode();
    this.expression(true);
    return this.addNode(Term.Expression);
  }

  expression(strict: boolean): boolean {
    return this.BinaryExpression(strict);
  }

  Parens(): boolean {
    this.startNode();
    if (!this.match("(")) {
      return this.endNode();
    }
    this.expression(false);
    this.match(")");
    return this.addNode(Term.Parens);
  }

  BinaryExpression(strict: boolean): boolean {
    return this.binaryExpression(
      this.config.operatorsByPrecedence.length - 1,
      strict
    );
  }

  binaryExpression(precedence: number, strict: boolean): boolean {
    if (precedence === -1) {
      return this.primaryExpression(strict);
    }
    this.startNode();
    let result = this.binaryExpression(precedence - 1, strict);
    if (!result) {
      return this.endNode();
    }
    while (
      this.ArithOpRegex(this.config.operatorsByPrecedence[precedence]) ||
      this.checkImplictOperator(precedence)
    ) {
      if (!this.binaryExpression(precedence - 1, false)) {
        return this.endNode();
      }
      this.addNodeAndStartEnclosing(Term.BinaryExpression);
    }
    this.endNode();
    return true;
  }

  checkImplictOperator(precedence: number): boolean {
    const implicitCheck = this.config.implicitOperators[precedence];
    if (implicitCheck == null) {
      return false;
    }
    this.skipWhitespace();
    // return false;
    return implicitCheck(this);
  }

  ArithOpRegex(op: RegExp): boolean {
    this.skipWhitespace();
    this.startNode();
    if (!this.matchRegex(op)) {
      return this.endNode();
    }
    return this.addNode(Term.ArithOp);
  }

  primaryExpression(strict: boolean): boolean {
    this.skipWhitespace();
    return (
      // Comment(this) ||
      this.Parens() ||
      Number(this) ||
      PrefixUnit(this) ||
      Reference(this) ||
      PredefinedUnit(this) ||
      (!strict && Unit(this))
    );
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

  skipWhitespace() {
    this.matchRegex(/^([ \t]+)/);
  }

  checkRegex(token: RegExp) {
    return token.test(this.input.chunk(this.pos));
  }

  check(token: string) {
    if (this.isAtEnd()) {
      return false;
    }
    return this.peek(token.length) === token;
  }

  peek(length: number) {
    return this.input.read(this.pos, this.pos + length);
  }

  peekFrom(from: number, length: number) {
    return this.input.read(this.pos + from, this.pos + from + length);
  }

  isAtEnd() {
    return this.pos === this.input.length;
  }
}

class ScopesParse extends Parse {
  expression(): boolean {
    this.pos += this.input.chunk(this.pos).length;
    return true;
  }
}

function buildTree(buffer: Array<number>) {
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
    topID: Term.Document,
  });
}

function incLast(array: Array<number>, x: number) {
  array[array.length - 1] += x;
}

// @ts-expect-error ignore unused
export function slog(tag: string, text: string) {
  // console.log(
  //   tag +
  //     ":" +
  //     text.replace(/\n/g, "\\n\n").replace(/ /g, "\\s").replace(/\t/g, "\\t")
  // );
}

export function stringToDoc(docString: string) {
  return {
    sliceString(from: number, to: number) {
      return docString.substring(from, to);
    },
  };
}

function analyzePass(ast: Tree, input: Input, config: ParserConfig) {
  const { names } = config;
  const docString = input.read(0, input.length);
  const doc = stringToDoc(docString);
  const cursor = ast.cursor();
  return analyzeDocument({ cursor, doc, names });
}
