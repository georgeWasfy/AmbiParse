import { alt, apply, lazy, parse, seq } from "../../src/parser";
import {
  applyDot,
  applyExpressions,
  applyField,
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
const constant = alt(STRING_LITERAL, NUMERIC_LITERAL);
const column = apply(IDENTIFIER, applyField);

const constant_expressions = alt(
  seq(
    constant,
    apply(COMMA, () => {}),
    lazy(() => expressions)
  ),
  constant
);

const column_expressions = alt(
  seq(
    alt(dot, column),
    apply(COMMA, () => {}),
    lazy(() => expressions)
  ),
  dot,
  column
);

const expressions = apply(
  alt(STAR, column_expressions, constant_expressions),
  applyExpressions
);

export const select_stmt = apply(
  seq(SELECT, expressions, alt(SEMICOLON, seq(FROM, table, SEMICOLON))),
  applySelect
);
const expParser = parse(select_stmt);
const result = expParser(" SElect 0x123ABC ;");
// console.log(JSON.stringify(result[0].value));
