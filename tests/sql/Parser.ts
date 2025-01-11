import { alt, apply, lazy, parse, seq } from "../../src/parser";
import {
  applyDot,
  applyFields,
  applySelect,
  applyTable,
  COMMA,
  DOT,
  FROM,
  IDENTIFIER,
  NUMERIC_LITERAL,
  SELECT,
  SEMICOLON,
  STAR,
  STRING_LITERAL,
} from "./Lexer";

const table = apply(IDENTIFIER, applyTable);
const dot = apply(seq(table, DOT, IDENTIFIER), applyDot);
const value = alt(STRING_LITERAL, NUMERIC_LITERAL);
const fields = apply(
  alt(
    seq(
      alt(IDENTIFIER, dot),
      apply(COMMA, () => {}),
      lazy(() => fields)
    ),
    IDENTIFIER,
    dot,
    STAR
  ),
  applyFields
);
export const select_stmt = apply(
  seq(SELECT, alt(seq(value, SEMICOLON), seq(fields, FROM, table, SEMICOLON))),
  applySelect
);
const expParser = parse(select_stmt);
const result = expParser(" SElect 0x123ABC ; ");
console.log(JSON.stringify(result[0].value));
