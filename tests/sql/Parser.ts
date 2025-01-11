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
  SELECT,
  STAR,
} from "./Lexer";

const table = apply(IDENTIFIER, applyTable);
const dot = apply(
  seq(
    table,
    DOT,
    IDENTIFIER
  ),
  applyDot
);
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
export const select_stmt = apply(seq(SELECT, fields, FROM, table), applySelect);

const expParser = parse(select_stmt);
const result = expParser("SElect Users.id, Users.name from Users");
// console.log(JSON.stringify(result[0].value));
