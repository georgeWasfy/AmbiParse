import { alt, apply, lazy, seq } from "../../src/parser";
import { expression } from "./Expression";
import { COMMA, FUNCTION, IDENTIFIER, LPAREN, RPAREN } from "./Lexer";

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

export const formalParameters = alt(
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
export const parameters = formalParameters;

export const functionDefinition = apply(
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
