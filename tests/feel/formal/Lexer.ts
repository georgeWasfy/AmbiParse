import { alt, apply, lazy, match, matchPattern, seq } from "../../../src/parser";
import { functionInvocation } from "./FunctionDefinition";

/********************************
 *      KEYWORDS
 ********************************/
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
export const RANGE = match("range");
export const LIST = match("list");
export const CONTEXT = match("context");

export const ReusableKeywords = alt(
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
 *      SEPARATOR LITERALS
 ********************************/
export const LPAREN = match("(");
export const RPAREN = match(")");
export const LBRACE = match("{");
export const RBRACE = match("}");
export const LBRACK = match("[");
export const RBRACK = match("]");
export const COMMA = match(",");
export const ELLIPSIS = match("..");
export const DOT = match(".");
export const BACKSLASH = match("/");

/********************************
 *      OPERATOR LITERALS
 ********************************/
export const EQUAL = match("=");
export const GT = match(">");
export const LT = match("<");
export const LE = match("<=");
export const GE = match(">=");
export const NOTEQUAL = match("!=");
export const COLON = match(":");
export const RARROW = match("->");
export const POW = match("**");
export const ADD = match("+");
export const SUB = match("-");
export const MUL = match("*");
export const DIV = match("/");
export const BANG = match("!");
export const NOT = match("not");
export const AT = match("@");

/********************************
 *      NUMBER LITERALS
 ********************************/
const digit = matchPattern("^[0-9]");

const digits = alt(
  digit,
  apply(
    seq(
      digit,
      lazy(() => digits)
    ),
    (d: string[]) => d.join("")
  )
);

export const NumericLiteral = alt(
  seq(SUB, alt(alt(digits, seq(digits, DOT, digits)), seq(DOT, digits))),
  alt(alt(digits, seq(digits, DOT, digits)), seq(DOT, digits))
);

/********************************
 *      STRING LITERALS
 ********************************/
export const StringLiteral = matchPattern(
  '"' +
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
    '"'
);

export const BooleanLiteral = alt(match("true"), match("false"));

/********************************
 *      IDENTIFIER
 ********************************/
const NameStartChar = matchPattern(
  `^[${[
    "\\?A-Z_a-z",
    "\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF",
    "\\u0370-\\u037D\\u037F-\\u1FFF",
    "\\u200C-\\u200D\\u2070-\\u218F",
    "\\u2C00-\\u2FEF\\u3001-\\uD7FF",
    "\\uF900-\\uFDCF\\uFDF0-\\uFFFD",
    "\\u{10000}-\\u{EFFFF}",
  ].join("")}]`
);

const NamePartChar = alt(
  NameStartChar,
  digit,
  matchPattern("[\\u00B7\\u0300-\\u036F\\u203F-\\u2040]")
);

const NamePart = alt(
  NamePartChar,
  seq(
    NamePartChar,
    lazy(() => NamePart)
  )
);
//Ignore Additional Name Symbols for now
const AdditionalNameSymbols = alt(DOT, BACKSLASH, SUB, ADD, MUL);
const NameStart = alt(
  NameStartChar,
  apply(seq(NameStartChar, NamePart), (tokens: string[]) => {
    return tokens.join("");
  })
);
export const Name = NameStart;

/********************************
 *      WHITESPACE && COMMENTS
 ********************************/

/********************************
 *       AT LITERAL
 ********************************/
const AtLiteral = seq(AT, StringLiteral);
const dateTimeLiteral = alt(
  AtLiteral,
  lazy(() => functionInvocation)
);
const simpleLiteral = alt(NumericLiteral, StringLiteral, BooleanLiteral, dateTimeLiteral);
export const literal = alt(simpleLiteral, NULL);
