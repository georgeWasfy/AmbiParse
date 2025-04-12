import { alt, apply, lazy, seq } from "../../../src/parser";
import { expression } from "./Expression";
import { COLON, COMMA, LPAREN, Name, RPAREN } from "./Lexer";

const parameterName = apply(Name, (name: string) => {
  return { type: "parameterName", name };
});
const namedParameters = apply(
  alt(
    apply(
      seq(
        parameterName,
        apply(COLON, () => {}),
        lazy(() => expression)
      ),
      ([param, _colon, exp]: any) => {
        return [{ ...param, value: exp }];
      }
    ),

    seq(
      apply(
        seq(
          parameterName,
          apply(COLON, () => {}),
          lazy(() => expression)
        ),
        ([param, _colon, exp]: any) => {
          return [{ ...param, value: exp }];
        }
      ),
      apply(COMMA, () => {}),
      lazy(() => namedParameters)
    )
  ),
  (params: string | string[]) => {
    return typeof params === "string" ? params : params.filter((value: any) => value !== undefined);
  }
);
const positionalParameters = apply(
  alt(
    lazy(() => expression),
    seq(
      lazy(() => expression),
      apply(COMMA, () => {}),
      lazy(() => positionalParameters)
    )
  ),
  (params: string | string[]) => {
    return typeof params === "string" ? params : params.filter((value: any) => value !== undefined);
  }
);
// TODO: Should handle function invocations without params
export const parameters = alt(
  apply(seq(LPAREN, positionalParameters, RPAREN), (params: any) => {
    return { type: "PositionalParameters", values: params.slice(1, -1) };
  }),
  apply(seq(LPAREN, namedParameters, RPAREN), (params: any) => {
    return { type: "NamedParameters", values: params.slice(1, -1) };
  })
);
export const functionInvocation = seq(
  lazy(() => expression),
  parameters
);
