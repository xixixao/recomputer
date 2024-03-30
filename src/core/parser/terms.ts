import { NodeType } from "@lezer/common";

let nodeTypeID = 0;

function newNodeType(name) {
  return NodeType.define({ id: nodeTypeID++, name });
}

// I wouldn't need these names if the highlight package wasn't so uber
// convoluted - this is all super error prone and should be just a plain list
const Terms = {
  Err: newNodeType("Err"),
  Document: newNodeType("Document"),
  BlankLine: newNodeType("BlankLine"),
  Comment: newNodeType("Comment"),
  StrongComment: newNodeType("StrongComment"),
  NormalComment: newNodeType("NormalComment"),
  Statement: newNodeType("Statement"),
  Name: newNodeType("Name"),
  URL: newNodeType("URL"),
  Number: newNodeType("Number"),
  Reference: newNodeType("Reference"),
  Unit: newNodeType("Unit"),
  BinOp: newNodeType("BinOp"),
  Assignment: newNodeType("Assignment"),
  Parens: newNodeType("Parens"),
  BinaryExpression: newNodeType("BinaryExpression"),
  Expression: newNodeType("Expression"),
  NestedStatements: newNodeType("NestedStatements"),
  ArithOp: newNodeType("ArithOp"),
};

export const NODE_SET = Object.values(Terms);

// TODO: use objectMap typed for TypeScript
export const Term = {
  Err: Terms.Err.id,
  Document: Terms.Document.id,
  BlankLine: Terms.BlankLine.id,
  Comment: Terms.Comment.id,
  StrongComment: Terms.StrongComment.id,
  NormalComment: Terms.NormalComment.id,
  Statement: Terms.Statement.id,
  Name: Terms.Name.id,
  URL: Terms.URL.id,
  Number: Terms.Number.id,
  Reference: Terms.Reference.id,
  Unit: Terms.Unit.id,
  BinOp: Terms.BinOp.id,
  Assignment: Terms.Assignment.id,
  Parens: Terms.Parens.id,
  BinaryExpression: Terms.BinaryExpression.id,
  Expression: Terms.Expression.id,
  NestedStatements: Terms.NestedStatements.id,
  ArithOp: Terms.ArithOp.id,
};
