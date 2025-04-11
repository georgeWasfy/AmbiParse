import { alt, apply, lazy, seq } from "../../src/parser";
import { additiveExpression, expression } from "./Expression";
import {
  IDENTIFIER,
  IN,
  COMMA,
  FOR,
  RETURN,
  SOME,
  SATISFIES,
  EVERY,
  LBRACK,
  RBRACK,
  ELLIPSIS,
  LPAREN,
  RPAREN,
} from "./Lexer";

// const iterationNameDefinitionToken = alt(
//   IDENTIFIER,
//   // additionalNameSymbol,
//   IntegerLiteral,
//   FloatingPointLiteral,
//   reusableKeywords,
//   IN,
//   lazy(() => iterationNameDefinitionToken)
// );
// // iterationNameDefinitionTokens parser
// const iterationNameDefinitionTokens = alt(
//   IDENTIFIER,
//   apply(seq(IDENTIFIER, iterationNameDefinitionToken), (tokens: any) => {
//     return {
//       type: "IterationNameDefinitionTokens",
//       tokens,
//       ctx: { text: tokens.join("") },
//     };
//   })
// );
// // iterationNameDefinition parser
// const iterationNameDefinition = apply(iterationNameDefinitionTokens, (tokens: any) => {
//   // scope.defineVariable("lll", tokens);
//   return tokens;
// });
export const endpoint = lazy(()=>additiveExpression);

export const interval = alt(
  // Case 1: (start..end)
  apply(seq(LPAREN, endpoint, ELLIPSIS, endpoint, RPAREN), ([low, start, _dots, end, up]: any) => ({
    type: "Interval",
    bounds: "()",
    start,
    end,
  })),

  // Case 2: (start..end]
  apply(seq(LPAREN, endpoint, ELLIPSIS, endpoint, RBRACK), ([low, start, _dots, end, up]: any) => ({
    type: "Interval",
    bounds: "(]",
    start,
    end,
  })),

  // Case 3: (start..end[
  apply(seq(LPAREN, endpoint, ELLIPSIS, endpoint, LBRACK), ([low, start, _dots, end, up]: any) => ({
    type: "Interval",
    bounds: "([",
    start,
    end,
  })),

  // Case 4: ]start..end)
  apply(seq(RBRACK, endpoint, ELLIPSIS, endpoint, RPAREN), ([low, start, _dots, end, up]: any) => ({
    type: "Interval",
    bounds: "])",
    start,
    end,
  })),

  // Case 5: ]start..end[
  apply(seq(RBRACK, endpoint, ELLIPSIS, endpoint, LBRACK), ([low, start, _dots, end, up]: any) => ({
    type: "Interval",
    bounds: "][",
    start,
    end,
  })),

  // Case 6: ]start..end]
  apply(seq(RBRACK, endpoint, ELLIPSIS, endpoint, RBRACK), ([low, start, _dots, end, up]: any) => ({
    type: "Interval",
    bounds: "]]",
    start,
    end,
  })),

  // Case 7: [start..end)
  apply(seq(LBRACK, endpoint, ELLIPSIS, endpoint, RPAREN), ([low, start, _dots, end, up]: any) => ({
    type: "Interval",
    bounds: "[)",
    start,
    end,
  })),

  // Case 8: [start..end[
  apply(seq(LBRACK, endpoint, ELLIPSIS, endpoint, LBRACK), ([low, start, _dots, end, up]: any) => ({
    type: "Interval",
    bounds: "[[",
    start,
    end,
  })),

  // Case 9: [start..end]
  apply(seq(LBRACK, endpoint, ELLIPSIS, endpoint, RBRACK), ([low, start, _dots, end, up]: any) => ({
    type: "Interval",
    bounds: "[]",
    start,
    end,
  }))
);
const iterationContext = apply(
  seq(
    apply(IDENTIFIER, (token: string) => {
      return {
        type: "IterationNameDefinitionToken",
        token,
      };
    }), //iterationNameDefinition,
    IN,
    lazy(() => expression)
  ),
  ([name, _in, expr]: any) => {
    return { type: "StandardIteration", name, expression: expr };
  }
);

const iterationContexts = alt(
  iterationContext,
  apply(
    seq(
      COMMA,
      lazy(() => iterationContexts)
    ),
    ([_comma, ctx]: any) => {
      return ctx;
    }
  )
);
export const forExpression = apply(
  seq(
    // Push scope at the start of the `for` expression
    apply(FOR, (x: any) => {
      // helper.pushScope();
      return FOR;
    }),
    iterationContext, //iterationContexts,
    RETURN,
    apply(
      lazy(() => expression),
      (expr: any) => {
        // helper.enableDynamicResolution();
        const result = expr;
        // helper.disableDynamicResolution();
        return result;
      }
    )
  ),
  ([_, contexts, _returnKeyword, expr]: any) => {
    // Pop scope after parsing the `for` expression
    // helper.popScope();
    return {
      type: "ForExpression",
      iterationContexts: contexts,
      returnExpression: expr,
    };
  }
);
export const quantifiedExpression = alt(
  // SOME case
  apply(
    seq(
      SOME,
      apply(iterationContext, (ctx: any) => {
        //iterationContext
        // helper.pushScope();
        return ctx;
      }),
      SATISFIES,
      apply(
        lazy(() => expression),
        (expr: any) => {
          // helper.enableDynamicResolution();
          const result = expr;
          // helper.disableDynamicResolution();
          // helper.popScope();
          return result;
        }
      )
    ),
    ([_some, ctx, _sat, expr]: any) => ({
      type: "QuantifiedExpressionSome",
      ctx,
      expression: expr,
    })
  ),

  // EVERY case
  apply(
    seq(
      EVERY,
      apply(iterationContext, (ctx: any) => {
        // helper.pushScope();
        return ctx;
      }),
      SATISFIES,
      apply(
        lazy(() => expression),
        (expr: any) => {
          // helper.enableDynamicResolution();
          const result = expr;
          // helper.disableDynamicResolution();
          // helper.popScope();
          return result;
        }
      )
    ),
    ([_every, ctx, _sat, expr]: any) => ({
      type: "QuantifiedExpressionEvery",
      ctx,
      expression: expr,
    })
  )
);
const expressionList = alt(
  lazy(() => expression),
  seq(
    lazy(() => expression),
    lazy(() => expressionList)
  ),
  apply(
    seq(
      COMMA,
      lazy(() => expression)
    ),
    ([_comma, exp]: any) => {
      return exp;
    }
  )
);

export const list = alt(
  apply(seq(LBRACK, RBRACK), () => ({
    type: "EmptyList",
    elements: [],
  })),
  apply(seq(LBRACK, expressionList, RBRACK), (params: any) => {
    return { type: "List", elements: params.slice(1, -1) };
  })
);
