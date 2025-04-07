/**************************
 *       EXPRESSIONS
 **************************/
import { alt, apply, lazy, optional, parse, Parser, seq } from "../../src/parser";
import {
  LPAREN,
  RPAREN,
  COMMA,
  COLON,
  FUNCTION,
  LBRACE,
  RBRACE,
  OR,
  EQUAL,
  GT,
  ADD,
  MUL,
  StringLiteral,
  IDENTIFIER,
  FOR,
  RETURN,
  IN,
  ELLIPSIS,
  EOF,
  IntegerLiteral,
  FloatingPointLiteral,
  reusableKeywords,
  DIV,
  DOT,
  QUOTE,
  SUB,
} from "./Lexer";
import { ScopeManager } from "./Scope";


// 3. Function Parameters
const positionalParameters = apply(
  alt(
    seq(
      IDENTIFIER,
      apply(COMMA, () => {}),
      lazy(() => positionalParameters)
    ),
    IDENTIFIER
  ),
  ([first, ...rest]: any) => {
    return [first, ...(rest.filter((value: any) => value !== undefined) || [])];
  }
);


const formalParameters = alt(
  // Empty parameters
  apply(seq(LPAREN, RPAREN), () => ({
    type: "parameters",
    variant: "empty",
  })),

  // Positional parameters
  apply(seq(LPAREN, positionalParameters, RPAREN), (params: string[]) => {
    return { type: "parameters", variant: "positional", values: params.slice(1, -1) };
  })
);

const functionDefinition = apply(
  seq(
    FUNCTION,
    formalParameters,
    lazy(() => expression)
  ),
  ([, params, body]: any) => ({
    type: "functionDefinition",
    parameters: params,
    body: body,
  })
);

// 2. TextualExpression
// const textualExpression = alt(functionDefinition, conditionalOrExpression);
const textualExpression = functionDefinition;

// 1. Expression Structure
const expression = apply(textualExpression, (expr: any) => ({
  type: "expression",
  value: expr,
}));

const exprParser = parse(expression);
const result = exprParser("function(asshkkkkkkk, e4,g7)");
console.log(JSON.stringify(result));

// const exprParser = parse(IDENTIFIER)
// const result = exprParser("a");
// console.log(JSON.stringify(result));
