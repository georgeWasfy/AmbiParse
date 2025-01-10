import { alt, apply, lazy, parse, seq } from "../../src/parser";
import {
  applyFields,
  applySelect,
  applyTable,
  COMMA,
  FROM,
  IDENTIFIER,
  SELECT,
  STAR,
} from "./Lexer";

const table = apply(IDENTIFIER, applyTable);
const fields = apply(
  alt(
    seq(
      IDENTIFIER,
      apply(COMMA,()=>{}),
      lazy(() => fields)
    ),
    IDENTIFIER,
    STAR
  ),
  applyFields
);
export const select_stmt = apply(
  seq(SELECT, fields, FROM, table),
  applySelect
);

const expParser = parse(select_stmt);
const result = expParser("SElect * from Users");
// console.log(JSON.stringify(result[0].value));
