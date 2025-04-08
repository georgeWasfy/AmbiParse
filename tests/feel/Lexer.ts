import { alt, apply, lazy, match, matchPattern, optional, seq } from "../../src/parser";

/********************************
 *      KEYWORDS
 ********************************/

export const QUOTE = match("'");
export const FOR = match("for");
export const RETURN = match("return");
export const IF = match("if");
export const THEN = match("then");
export const ELSE = match("else");
export const SOME = match("some");
export const EVERY = match("every");
export const SATISFIES = match("satisfies");
export const INSTANCE = match("instance");
export const OF = match("of");
export const FUNCTION = match("function");
export const EXTERNAL = match("external");
export const OR = match("or");
export const AND = match("and");
export const BETWEEN = match("between");
export const NULL = match("null");
export const UNDEFINEDVALUE = match("undefined");
export const TRUE = match("true");
export const FALSE = match("false");
export const IN = match("in");
export const EOF = matchPattern("/^$/");

export const reusableKeywords = alt(
  FOR,
  RETURN,
  IF,
  THEN,
  ELSE,
  SOME,
  EVERY,
  SATISFIES,
  INSTANCE,
  OF,
  FUNCTION,
  EXTERNAL,
  OR,
  AND,
  BETWEEN,
  NULL,
  UNDEFINEDVALUE,
  TRUE,
  FALSE
);

/********************************
 *      NUMBER LITERALS
 ********************************/
export const ZERO = match("0");
export const X = match("x");
export const P = match("p");
export const E = match("e");
export const UNDERSCORE = match("_");
export const PLUS = match("+");
export const MINUS = match("-");
export const F = match("f");
export const D = match("d");
export const L = match("l");

export const IntegerLiteral = matchPattern(
  "(?:" +
    "0[xX][0-9A-Fa-f_]+" + // HexIntegerLiteral
    "|" +
    "[0-9][0-9_]*" + // DecimalIntegerLiteral
    ")[lL]?" // Optional suffix
);

export const FloatingPointLiteral = matchPattern(
  "^(?:" +
    // Decimal formats
    "[0-9][0-9_]*\\.[0-9_]+([eE][+-]?[0-9_]+)?[fFdD]?" + // 1.23, 1.23e4
    "|\\.[0-9_]+([eE][+-]?[0-9_]+)?[fFdD]?" + // .23
    "|[0-9][0-9_]*[eE][+-]?[0-9_]+[fFdD]?" + // 1e4
    "|[0-9][0-9_]*[fFdD]" + // 1f
    "|" +
    // Hexadecimal formats
    "0[xX][0-9A-Fa-f_]+(\\.[0-9A-Fa-f_]+)?[pP][+-]?[0-9_]+[fFdD]?" + // 0x1.2p3
    ")$"
);

export const DecimalNumeral = matchPattern("^[0-9][0-9_]*");
export const HexNumeral = matchPattern("^0[xX][0-9A-Fa-f_]+");
export const ExponentPart = matchPattern("^[eE][+-]?[0-9_]+");
export const BinaryExponent = matchPattern("^[pP][+-]?[0-9_]+");

/********************************
 *      STRING LITERALS
 ********************************/
// Single-character tokens
export const QUOTE_DOUBLE = match('"');
export const BACKSLASH = match("\\");
export const U = match("u");
export const UPPERCASE_U = match("U"); // For 6-digit Unicode escapes

// Escape sequence components (if needed separately)
export const BasicEscape = matchPattern("\\\\[^uU]"); // \ followed by any non-Unicode character
export const UnicodeEscape = matchPattern(
  "\\\\u[0-9A-Fa-f]{4}" + // 4-digit Unicode escape
    "|" +
    "\\\\U[0-9A-Fa-f]{6}" // 6-digit Unicode escape (non-standard extension)
);

// Complete StringLiteral parser
export const StringLiteral = matchPattern(
  '^"' + // Opening quote
    "(" +
    "(?:" +
    '[^"\\\\]' + // Non-special characters
    "|" +
    "\\\\[^uU]" + // Basic escapes (\n, \t, \", etc.)
    "|" +
    "\\\\u[0-9A-Fa-f]{4}" + // 4-digit Unicode
    "|" +
    "\\\\U[0-9A-Fa-f]{6}" + // 6-digit Unicode (extension)
    ")" +
    "*)" + // Zero or more characters
    '"$' // Closing quote
);

export const BooleanLiteral = alt(match("true"), match("false"));

/********************************
 *      SEPARATOR LITERALS
 ********************************/
// Separators
export const LPAREN = match("(");
export const RPAREN = match(")");
export const LBRACE = match("{");
export const RBRACE = match("}");
export const LBRACK = match("[");
export const RBRACK = match("]");
export const COMMA = match(",");
export const ELLIPSIS = match("..");
export const DOT = match(".");

/********************************
 *      OPERATOR LITERALS
 ********************************/
export const OPS = ["=", ">", "<", "<=", ">=", "!=", "!", "*", "**"];
// Operators
export const EQUAL = matchPattern("=");
export const GT = matchPattern(">");
export const LT = matchPattern("<");
export const LE = matchPattern("<=");
export const GE = matchPattern(">=");
export const NOTEQUAL = matchPattern("!=");
export const COLON = matchPattern(":");
export const RARROW = matchPattern("->");
export const POW = match("**");
export const ADD = match("+");
export const SUB = match("-");
export const MUL = match("*");
export const DIV = match("/");
export const BANG = matchPattern("!");
export const NOT = matchPattern("not");
export const AT = matchPattern("@");

/********************************
 *      IDENTIFIER
 ********************************/

// Helper component parsers (if needed for composition)
export const NameStartChar = alt(
  matchPattern("/?/"),
  matchPattern("[A-Z]"),
  matchPattern("[a-z]"),
  matchPattern("_"),
  matchPattern("[\u00C0-\u00D6]"),
  matchPattern("[\u00D8-\u00F6]"),
  matchPattern("[\u00F8-\u02FF]"),
  matchPattern("[\u0370-\u037D\u037F-\u1FFF]"),
  matchPattern("[\u200C-\u200D]"),
  matchPattern("[\u2070-\u218F]"),
  matchPattern("[\u2C00-\u2FEF]"),
  matchPattern("[\u3001-\uD7FF]"),
  matchPattern("[\uF900-\uFDCF]"),
  matchPattern("[\uFDF0-\uFFFD]"),
  matchPattern("[\u{10000}-\u{EFFFF}]")
);

export const NameStartCharOrPart = matchPattern(
  `[${[
    "?A-Z_a-z0-9",
    "\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF",
    "\\u0370-\\u037D\\u037F-\\u1FFF",
    "\\u200C-\\u200D\\u2070-\\u218F",
    "\\u2C00-\\u2FEF\\u3001-\\uD7FF",
    "\\uF900-\\uFDCF\\uFDF0-\\uFFFD",
    "\\u{10000}-\\u{EFFFF}",
    "\\u00B7\\u0300-\\u036F\\u203F-\\u2040",
  ].join("")}]+`
);
// Identifier Parser
export const IDENTIFIER = alt(
  apply(seq(NameStartChar, NameStartCharOrPart), (x: string[]) => {
    return [x.filter((value: any) => value !== undefined).join("")];
  }),
  NameStartChar
);

/********************************
 *      WHITESPACE && COMMENTS
 ********************************/
// Whitespace
export const WS = matchPattern(
  "[ \\t\\r\\n\\u000C\\u00A0]" // Spaces, tabs, newlines, form feed, non-breaking space
);

// Block comments
export const COMMENT = matchPattern(
  "^/\\*[\\s\\S]*?\\*/" // Non-greedy match between /* and */
);

// Line comments
export const LINE_COMMENT = matchPattern(
  "^//[^\\r\\n]*" // Everything after // until end of line
);

// Combined whitespace/comment skipper (if needed)
export const SKIP = alt(
  apply(WS, () => null),
  apply(COMMENT, () => null),
  apply(LINE_COMMENT, () => null)
);
