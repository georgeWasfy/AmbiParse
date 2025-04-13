import { alt, apply, lazy, seq } from "../../../src/parser";
import { expression, Expression } from "./FunctionDefinition";
import { COLON, COMMA, Name, StringLiteral, LBRACE, RBRACE } from "./Lexer";
type Key = string;

type ContextEntry = {
  type: "ContextEntry";
  key: Key;
  value: Expression;
};

export type Context = {
  type: "Context";
  entries: ContextEntry[];
};
const key = alt(Name, StringLiteral);
const contextEntry = apply(
  seq(
    key,
    apply(COLON, () => {}),
    lazy(() => expression)
  ),
  ([key, _, value]: [string, string, Expression]): ContextEntry => ({
    type: "ContextEntry",
    key,
    value,
  })
);
const contextEntries = alt(
  contextEntry,
  seq(
    contextEntry,
    apply(COMMA, () => {}),
    lazy(() => contextEntries)
  )
);
export const context = apply(
  alt(
    apply(
      seq(
        apply(LBRACE, () => {}),
        apply(RBRACE, () => {})
      ),
      () => []
    ),
    seq(
      apply(LBRACE, () => {}),
      contextEntries,
      apply(RBRACE, () => {})
    )
  ),
  (entries: (ContextEntry | undefined)[]) => ({
    type: "Context",
    entries: entries.filter((x) => x !== undefined),
  })
);
