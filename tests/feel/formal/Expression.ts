import { alt, apply, lazy, seq } from "../../../src/parser";
import { type } from "./FunctionDefinition";

import { ADD, AND, BETWEEN as BETWEENkw, DIV, DOT, EQUAL, GE, GT, IN, INSTANCE, LBRACK, LE, LPAREN, LT, MUL, Name, NOTEQUAL, NumericLiteral, OF, OR, POW, RBRACK, RPAREN, StringLiteral, SUB, TRUE, FALSE, NULL } from "./Lexer";
import { simplePositiveUnaryTest, simplePositiveUnaryTests } from "./UnaryTest";

export type Expression = any;

const baseExpression = alt(Name, NumericLiteral, StringLiteral, TRUE, FALSE, NULL);

const parenthesizedExpression = apply(
  seq(LPAREN, lazy(() => textualExpression), RPAREN),
  (tokens: any) => tokens[1]
);

const simpleValue = alt(baseExpression, parenthesizedExpression);

const arithmeticNegation = alt(
  simpleValue,
  apply(seq(SUB, simpleValue), (tokens: any) => ({
    type: "ArithmeticNegation",
    operator: tokens[0],
    value: tokens[1],
  }))
);

const exponentiationExpression = alt(
  arithmeticNegation,
  apply(
    seq(lazy(() => exponentiationExpression), POW, arithmeticNegation),
    (tokens: any) => ({
      type: "ExponentiationExpression",
      operator: tokens[1],
      left: tokens[0],
      right: tokens[2],
    })
  )
);

const multiplicativeExpression = alt(
  apply(seq(lazy(() => multiplicativeExpression), alt(MUL, DIV), exponentiationExpression), (tokens: any) => ({
    type: "MultiplicativeExpression",
    operator: tokens[1],
    left: tokens[0],
    right: tokens[2],
  })),
  exponentiationExpression
);

const additiveExpression = alt(
  apply(seq(lazy(() => additiveExpression), ADD, multiplicativeExpression), (tokens: any) => ({
    type: "AdditiveExpression",
    operator: tokens[1],
    left: tokens[0],
    right: tokens[2],
  })),
  apply(seq(lazy(() => additiveExpression), SUB, multiplicativeExpression), (tokens: any) => ({
    type: "AdditiveExpression",
    operator: tokens[1],
    left: tokens[0],
    right: tokens[2],
  })),
  multiplicativeExpression
);

export const arithmeticExpression = additiveExpression;

const pathExpression = apply(
  seq(lazy(() => pathOrHigher), DOT, Name),
  (tokens: any) => ({
    type: "PathExpression",
    object: tokens[0],
    property: tokens[2],
  })
);

const filterExpression = apply(
  seq(lazy(() => pathOrHigher), LBRACK, lazy(() => textualExpression), RBRACK),
  (tokens: any) => ({
    type: "FilterExpression",
    object: tokens[0],
    filter: tokens[2],
  })
);

const pathOrHigher = alt(
  pathExpression,
  filterExpression,
  arithmeticExpression
);

const instanceOfExpression = apply(
  seq(pathOrHigher, INSTANCE, OF, type),
  (tokens: any) => ({
    type: "InstanceOfExpression",
    expression: tokens[0],
    typeName: tokens[3],
  })
);

const instanceOfOrHigher = alt(instanceOfExpression, pathOrHigher);

const comparisonExpression = alt(
  apply(seq(instanceOfOrHigher, alt(EQUAL, NOTEQUAL, LT, LE, GT, GE), instanceOfOrHigher), (tokens: any) => ({
    type: "ComparisonExpression",
    operator: tokens[1],
    left: tokens[0],
    right: tokens[2],
  })),
  apply(seq(instanceOfOrHigher, BETWEENkw, instanceOfOrHigher, AND, instanceOfOrHigher), (tokens: any) => ({
    type: "BetweenExpression",
    expression: tokens[0],
    left: tokens[2],
    right: tokens[4],
  })),
  apply(seq(instanceOfOrHigher, IN, simplePositiveUnaryTest), (tokens: any) => ({
    type: "InExpression",
    expression: tokens[0],
    unaryTest: tokens[2],
  })),
  apply(seq(instanceOfOrHigher, IN, LPAREN, simplePositiveUnaryTests, RPAREN), (tokens: any) => ({
    type: "InExpression",
    expression: tokens[0],
    unaryTests: tokens[3],
  })),
  instanceOfOrHigher
);

const conjunctionExpression = alt(
  apply(seq(lazy(() => conjunctionExpression), AND, comparisonExpression), (tokens: any) => ({
    type: "Conjunction",
    left: tokens[0],
    right: tokens[2],
  })),
  comparisonExpression
);

const disjunctionExpression = alt(
  apply(seq(lazy(() => disjunctionExpression), OR, conjunctionExpression), (tokens: any) => ({
    type: "Disjunction",
    left: tokens[0],
    right: tokens[2],
  })),
  conjunctionExpression
);

const forExpression = lazy(() => require("./BranchesAndIterations").forExpression);
const ifExpression = lazy(() => require("./BranchesAndIterations").ifExpression);
const quantifiedExpression = lazy(() => require("./BranchesAndIterations").quantifiedExpression);

const forIfQuantOrHigher = alt(
  forExpression,
  ifExpression,
  quantifiedExpression,
  disjunctionExpression
);

export const textualExpression = forIfQuantOrHigher;
