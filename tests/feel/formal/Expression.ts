import { alt, apply, lazy, seq } from "../../../src/parser";

import { ADD, DIV, MUL, Name, NumericLiteral, POW, StringLiteral, SUB } from "./Lexer";

export const expression = alt(Name, NumericLiteral, StringLiteral);
export type Expression = any;

const arithmeticNegation = alt(
  expression,
  apply(seq(SUB, expression), ([op, exp]: any) => {
    return {
      type: "ArithmeticNegation",
      operator: op,
      value: exp,
    };
  })
);
const exponentiationExpression = alt(
  arithmeticNegation,
  apply(
    seq(
      lazy(() => exponentiationExpression),
      POW,
      arithmeticNegation
    ),
    ([left, op, right]: any) => {
      return {
        type: "ExponentiationExpression",
        operator: op,
        left,
        right,
      };
    }
  )
);
const multiplicativeExpression = alt(
  apply(
    seq(
      lazy(() => multiplicativeExpression),
      alt(MUL, DIV),
      exponentiationExpression
    ),
    ([left, op, right]: any) => {
      return {
        type: "MultiplicativeExpression",
        operator: op,
        left,
        right,
      };
    }
  ),
  exponentiationExpression
);
const additiveExpression = alt(
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

export const arithmeticExpression = additiveExpression;
