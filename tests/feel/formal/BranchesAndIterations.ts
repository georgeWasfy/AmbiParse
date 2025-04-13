import { alt, apply, lazy, seq } from "../../../src/parser";
import { Expression, expression } from "./Expression";
import { COMMA, ELLIPSIS, ELSE, FOR, IF, IN, LBRACK, Name, RBRACK, RETURN, THEN } from "./Lexer";

type ForExpression = {
  type: "ForExpression";
  variables: IterationVariable[];
  returnExpr: Expression;
};

type IterationVariable = {
  type: "IterationVariable";
  name: string;
  context: {
    type: "IterationContext";
    start: Expression;
    end: Expression | null;
  };
};

type IfExpression = {
  type: "IfExpression";
  condition: Expression;
  thenBranch: Expression;
  elseBranch: Expression;
};
export const listExpressions = alt(
  lazy(() => expression),
  seq(
    lazy(() => expression),
    apply(COMMA, () => {}),
    lazy(() => listExpressions)
  )
);
export const list = alt(
  apply(
    seq(
      apply(LBRACK, () => {}),
      apply(RBRACK, () => {})
    ),
    () => ({
      type: "List",
      elements: [],
    })
  ),
  apply(
    seq(
      apply(LBRACK, () => {}),
      listExpressions,
      apply(RBRACK, () => {})
    ),
    (params: (Expression | undefined)[]) => {
      return {
        type: "List",
        elements: params.filter((x) => x !== undefined),
      };
    }
  )
);

const iterationContext = apply(
  seq(
    Name,
    IN,
    alt(
      lazy(() => expression),
      seq(
        lazy(() => expression),
        ELLIPSIS,
        lazy(() => expression)
      )
    )
  ),
  ([name, _in, expr1, _, expr2]: [string, string, Expression, string, Expression | undefined]) => {
    return {
      type: "IterationVariable",
      name,
      context: {
        type: "IterationContext",
        start: expr1,
        end: expr2 ?? null,
      },
    };
  }
);

const iterationContexts = alt(
  iterationContext,
  apply(
    seq(
      iterationContext,
      COMMA,
      lazy(() => iterationContexts)
    ),
    ([ctx1, _comma, ctx2]: [IterationVariable, string, IterationVariable]) => {
      return [[ctx1, ctx2]]; //TODO: fix in the parser combinator as it always flattens first array
    }
  )
);
export const forExpression = apply(
  seq(
    FOR,
    iterationContexts,
    RETURN,
    lazy(() => expression)
  ),
  ([_, contexts, _returnKeyword, expr]: [string, IterationVariable[], string, Expression]) => {
    return {
      type: "ForExpression",
      variables: [contexts],
      returnExpression: expr,
    };
  }
);

/********************************
 * For Expression EXAMPLES *
 ********************************/
// 1. for x in 1..5, y in 2..10, z in 2..9 return x

export const ifExpression = apply(
  seq(
    IF,
    lazy(() => expression),
    THEN,
    lazy(() => expression),
    ELSE,
    lazy(() => expression)
  ),
  ([_if, condition, _then, thenBranch, _else, elseBranch]: [
    string,
    Expression,
    string,
    Expression,
    string,
    Expression
  ]) => ({
    type: "IfExpression",
    condition,
    thenBranch,
    elseBranch,
  })
);

/********************************
 * For Expression EXAMPLES *
 ********************************/
// 1. if 1 then 2 else 3
