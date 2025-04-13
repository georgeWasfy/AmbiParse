import { alt, apply, lazy, seq } from "../../../src/parser";
import { Expression, expression } from "./FunctionDefinition";
import { COMMA, LBRACK, RBRACK } from "./Lexer";
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
