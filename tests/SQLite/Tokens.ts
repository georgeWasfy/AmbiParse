import { alt, match, matchPattern, seq } from "../../src/parser";

const matchParser = match();
const matchInParser = matchPattern();
const altParser = alt();
const seqParser = seq();

export const DOT = matchParser(".");
export const COMMA = matchParser(",");
export const OPEN_PAR = matchParser("(");
export const CLOSE_PAR = matchParser(")");
export const SINGLE_QUOTE = matchParser("'");
export const MINUS = matchParser("-");
export const PLUS = matchParser("+");
export const TILDE = matchParser("~");
export const NOT = matchParser("NOT");
export const PIPE = matchParser("|");
export const PIPE2 = matchParser("||");
export const STAR = matchParser("*");
export const DIV = matchParser("/");
export const MOD = matchParser("%");
export const AS = matchParser("AS");

export const LT2 = matchParser("<<");
export const GT2 = matchParser(">>");
export const AMP = matchParser("&");

export const LT = matchParser("<");
export const LT_EQ = matchParser("<=");
export const GT = matchParser(">");
export const GT_EQ = matchParser(">=");

export const AND = matchParser("AND");
export const OR = matchParser("OR");

export const CHARACTERS = matchInParser("^[A-Za-z]");
export const NUMBERS = matchInParser(`^\\d+(\\.\\d+)?`);
export const DIGIT = "[0-9]";
export const DIGITS = "^[0-9]";
export const HEX_DIGIT = "[0-9A-F]";
export const NUMERIC_LITERAL = matchInParser(
  `^((${DIGIT}+ ('.' ${DIGIT}*)?) | ('.' ${DIGIT}+)) ('E' [-+]? ${DIGIT}+)? | '0x' ${HEX_DIGIT}+`
);

export const KEYWORD = altParser(
  () => matchParser("RENAME"),
  () => matchParser("TO"),
  () => matchParser("DROP"),
  () => matchParser("COLUMN"),
  () => matchParser("ALTER"),
  () => matchParser("TABLE"),
  () => matchParser("WITH"),
  () => matchParser("RECUSIVE")
);
export const STRING_LITERAL = seqParser(
  () => SINGLE_QUOTE,
  () => CHARACTERS,
  () => SINGLE_QUOTE
);
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
export const LITERAL_VALUE = altParser(
  () => NUMERIC_LITERAL,
  () => STRING_LITERAL,
  () => matchParser("NULL"),
  () => matchParser("TRUE"),
  () => matchParser("FALSE")
);

export const IDENTIFIER = altParser(
  () => matchInParser(`"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"`), //characters encapsulated ""
  () => matchInParser("`(?:[^`]|``)*`"), // characters encapsulated ``
  () => matchInParser("\\[([^\\]]*)\\]"), // characters encapsulated []
  () => matchInParser("[A-Z_\u007F-\uFFFF][A-Z_0-9\u007F-\uFFFF]*")
);
