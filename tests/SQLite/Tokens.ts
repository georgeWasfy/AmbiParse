import { alt, match, matchPattern, seq } from "../../src/parser";


export const DOT = match(".");
export const COMMA = match(",");
export const OPEN_PAR = match("(");
export const CLOSE_PAR = match(")");
export const SINGLE_QUOTE = match("'");
export const MINUS = match("-");
export const PLUS = match("+");
export const TILDE = match("~");
export const NOT = match("NOT");
export const PIPE = match("|");
export const PIPE2 = match("||");
export const STAR = match("*");
export const DIV = match("/");
export const MOD = match("%");
export const AS = match("AS");

export const LT2 = match("<<");
export const GT2 = match(">>");
export const AMP = match("&");

export const LT = match("<");
export const LT_EQ = match("<=");
export const GT = match(">");
export const GT_EQ = match(">=");

export const AND = match("AND");
export const OR = match("OR");

export const CHARACTERS = matchPattern("^[A-Za-z]");
export const NUMBERS = matchPattern(`^\\d+(\\.\\d+)?`);
export const DIGIT = "[0-9]";
export const DIGITS = match("^[0-9]");
export const HEX_DIGIT = "[0-9A-F]";
export const NUMERIC_LITERAL = matchPattern(
  `^((${DIGIT}+ ('.' ${DIGIT}*)?) | ('.' ${DIGIT}+)) ('E' [-+]? ${DIGIT}+)? | '0x' ${HEX_DIGIT}+`
);

export const KEYWORD = alt(
  match("RENAME"),
  match("TO"),
  match("DROP"),
  match("COLUMN"),
  match("ALTER"),
  match("TABLE"),
  match("WITH"),
  match("RECUSIVE")
);
export const STRING_LITERAL = seq(SINGLE_QUOTE, CHARACTERS, SINGLE_QUOTE);
// literal_value
//     : NUMERIC_LITERAL
//     | STRING_LITERAL
//     | BLOB_LITERAL
//     | NULL_
//     | TRUE_
//     | FALSE_
//     | CURRENT_TIME_
//     | CURRENT_DATE_
//     | CURRENT_TIMESTAMP_
export const LITERAL_VALUE = alt(
  NUMERIC_LITERAL,
  STRING_LITERAL,
  match("NULL"),
  match("TRUE"),
  match("FALSE")
);

export const IDENTIFIER = alt(
  matchPattern(`"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"`), //characters encapsulated ""
  matchPattern("`(?:[^`]|``)*`"), // characters encapsulated ``
  matchPattern("\\[([^\\]]*)\\]"), // characters encapsulated []
  matchPattern("[A-Z_\u007F-\uFFFF][A-Z_0-9\u007F-\uFFFF]*")
);
