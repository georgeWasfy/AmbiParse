import { alt, apply, lazy, seq } from "../../src/parser";
import { forExpression, interval, list, quantifiedExpression } from "./BranchesAndIteration";
import { positiveUnaryTests, simplePositiveUnaryTest } from "./ComparisonAndTests";
import { parameters } from "./FunctionDefinition";
import {
  LPAREN,
  RPAREN,
  DOT,
  SUB,
  ADD,
  LBRACK,
  RBRACK,
  POW,
  MUL,
  DIV,
  BETWEEN,
  AND,
  IN,
  EQUAL,
  LT,
  GT,
  OR,
} from "./Lexer";
import { literal, qualifiedName } from "./Literal";

/**************************
 *       EXPRESSIONS
 **************************/

// 2. TextualExpression
// const textualExpression = alt(functionDefinition, conditionalOrExpression);
const textualExpression = lazy(() => conditionalOrExpression);

// 1. Expression Structure
export const expression = apply(textualExpression, (expr: any) => {
  if (expr !== undefined)
    return {
      type: "expression",
      value: expr,
    };
});
// 4. Conditional Or Expression
const primary = alt(
  // Case 1: literal
  apply(literal, (val: any) => {
    return { type: "PrimaryLiteral", value: val };
  }),

  // Case 2: for expression
  apply(forExpression, (expr: any) => ({
    type: "PrimaryForExpression",
    expression: expr,
  })),

  // Case 3: quantified expression
  apply(quantifiedExpression, (expr: any) => ({
    type: "PrimaryQuantifiedExpression",
    expression: expr,
  })),

  // // Case 4: if expression
  // apply(ifExpression, (expr: any) => ({
  //   type: "PrimaryIfExpression",
  //   expression: expr,
  // })),

  // Case 5: interval
  apply(interval, (i: any) => ({
    type: "PrimaryInterval",
    interval: i,
  })),

  // Case 6: list
  apply(list, (l: any) => ({
    type: "PrimaryList",
    list: l,
  })),

  // // Case 7: context
  // apply(context, (ctx: any) => ({
  //   type: "PrimaryContext",
  //   context: ctx,
  // })),

  // Case 8: parenthesized expression
  apply(seq(LPAREN, expression, RPAREN), (expr: any) => ({
    type: "PrimaryParens",
    expression: expr.slice(1, -1),
  })),

  // Case 9: unary test
  apply(simplePositiveUnaryTest, (test: any) => {
    return { type: "PrimaryUnaryTest", test };
  }),

  // Case 10: qualified name
  apply(qualifiedName, (name: any) => ({
    type: "PrimaryName",
    name,
  }))
);
const unaryExpressionNotPlusMinus = alt(
  primary,
  seq(primary, DOT, qualifiedName, parameters),
  seq(primary, DOT, qualifiedName)
);

///////HERE: unaryExpressionNotPlusMinus tested////////////
const unaryExpression = alt(
  apply(
    seq(
      lazy(() => unaryExpression),
      parameters
    ),
    ([name, params]: any) => {
      return {
        type: "FnInvocation",
        name,
        params,
      };
    }
  ),
  apply(
    seq(
      SUB,
      lazy(() => unaryExpression)
    ),
    ([_sub, exp]: any) => {
      return {
        type: "SignedUnaryExpressionMinus",
        sign: _sub,
        exp,
      };
    }
  ),
  unaryExpressionNotPlusMinus,
  seq(ADD, unaryExpressionNotPlusMinus)
);

const filterPathExpression = alt(
  apply(
    seq(
      lazy(() => filterPathExpression),
      LBRACK,
      expression,
      RBRACK
    ),
    ([n0, _lbrack, exp, _rbrack]: any) => {
      return {
        type: "FilterPathExpressionWithBrackets",
        name: n0,
        filter: exp,
      };
    }
  ),
  apply(
    seq(
      lazy(() => filterPathExpression),
      DOT,
      qualifiedName
    ),
    ([n1, _dot, name]: any) => {
      return {
        type: "FilterPathExpressionWithDot",
        name: n1,
        filter: name,
      };
    }
  ),
  unaryExpression
);
const powerExpression = alt(
  filterPathExpression,
  apply(
    seq(
      lazy(() => powerExpression),
      POW,
      filterPathExpression
    ),
    ([left, op, right]: any) => {
      // To handle the case of power ** as the first * will match with MUL symbol
      // TODO: this needs to be recursive and at each level check left and right

      // if (
      //   (typeof left === "string" && OPS.some((op) => left.includes(op))) ||
      //   (typeof right === "string" && OPS.some((op) => right.includes(op)))
      // )
      //   return undefined;
      return {
        type: "PowerExpression",
        operator: op,
        left,
        right,
      };
    }
  )
);
//Note: if in base case I use alt(IDENTIFIER, Integarliteral)
// each expression is repeated twice whuch are exactly the same?? to be habdled
const multiplicativeExpression = alt(
  apply(
    seq(
      lazy(() => multiplicativeExpression),
      alt(MUL, DIV),
      powerExpression
    ),
    ([left, op, right]: any) => {
      // To handle the case of power ** as the first * will match with MUL symbol
      // TODO: this needs to be recursive and at each level check left and right
      // if (
      //   (typeof left === "string" && !OPS.some((op) => left.includes(op))) ||
      //   (typeof right === "string" && !OPS.some((op) => right.includes(op)))
      // )
      //   return undefined;
      return {
        type: "MultiplicativeExpression",
        operator: op,
        left,
        right,
      };
    }
  ),
  powerExpression
);
export const additiveExpression = alt(
  apply(
    seq(
      lazy(() => additiveExpression),
      ADD,
      multiplicativeExpression
    ),
    ([left, op, right]: any) => {
      return {
        type: "AdditiveExpression",
        operator: op,
        left,
        right,
      };
    }
  ),
  apply(
    seq(
      lazy(() => additiveExpression),
      SUB,
      multiplicativeExpression
    ),
    ([left, op, right]: any) => {
      return {
        type: "AdditiveExpression",
        operator: op,
        left,
        right,
      };
    }
  ),
  multiplicativeExpression
);
// TODO: InListExpression,InExpression not tested
const relationalExpression = alt(
  apply(
    seq(
      lazy(() => relationalExpression),
      BETWEEN,
      additiveExpression,
      AND,
      additiveExpression
    ),
    ([val, _b, start, _a, end]: any) => ({
      type: "BetweenExpression",
      value: val,
      start,
      end,
    })
  ),
  apply(
    seq(
      lazy(() => relationalExpression),
      IN,
      LPAREN,
      positiveUnaryTests,
      RPAREN
    ),
    ([val, _in, _lparen, tests, _rparen]: any) => ({
      type: "InListExpression",
      value: val,
      tests,
    })
  ),
  apply(
    seq(
      lazy(() => relationalExpression),
      IN,
      expression
    ),
    ([val, _in, expr]: any) => ({
      type: "InExpression",
      value: val,
      expression: expr,
    })
  ),
  additiveExpression
);
const comparisonExpression = alt(
  relationalExpression,
  apply(
    seq(
      lazy(() => comparisonExpression),
      alt(EQUAL, LT, GT),
      relationalExpression
    ),
    ([left, op, right]: any) => {
      // console.log("🚀 ~ right:", right)
      // console.log("🚀 ~ left:", left)
      // if (
      //   ( OPS.some((op) => left.includes(op))) ||
      //   ( OPS.some((op) => right.includes(op)))
      // )
      //   return undefined;
      return {
        type: "ComparisonExpression",
        operator: op,
        left,
        right,
      };
    }
  )
);
const conditionalAndExpression = alt(
  apply(
    seq(
      lazy(() => conditionalAndExpression),
      AND,
      comparisonExpression
    ),
    ([left, op, right]: any) => {
      return {
        type: "LogicalExpression",
        operator: op,
        left,
        right,
      };
    }
  ),
  comparisonExpression
);

export const conditionalOrExpression = alt(
  apply(
    seq(
      lazy(() => conditionalOrExpression),
      OR,
      conditionalAndExpression
    ),
    ([left, op, right]: any) => {
      return {
        type: "LogicalExpression",
        operator: op,
        left,
        right,
      };
    }
  ),
  conditionalAndExpression
);
