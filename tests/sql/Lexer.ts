import { alt, apply, match, matchPattern, seq } from "../../src/parser";

type GenericObject<T> = {
  type: string;
  value: T;
};

export const STAR = match("*");
export const DOT = match(".");
export const COMMA = match(",");

export const OPEN_PAR = match("(");
export const CLOSE_PAR = match(")");
export const SINGLE_QUOTE = match("'");
export const MINUS = match("-");
export const PLUS = match("+");
export const TILDE = match("~");
export const PIPE = match("|");
export const PIPE2 = match("||");
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

export const IDENTIFIER = matchPattern("^([a-zA-Z_$][a-zA-Z0-9_$]*)");
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
export const SELECT = apply(
  seq(
    alt(match("S"), match("s")),
    alt(match("E"), match("e")),
    alt(match("L"), match("l")),
    alt(match("E"), match("e")),
    alt(match("C"), match("c")),
    alt(match("T"), match("t"))
  ),
  (v: string[]) => {
    return { type: "SELECT", value: v.join("") };
  }
);
export const FROM = apply(
  seq(
    alt(match("F"), match("f")),
    alt(match("R"), match("r")),
    alt(match("O"), match("o")),
    alt(match("M"), match("m"))
  ),
  (v: string[]) => {
    return { type: "FROM", value: v.join("") };
  }
);

// ==================================APPLY MODIFIERS================================================

export const applyTable = (table: string) => {
  return { type: "TABLE", value: table };
};

export const applyFields = (
  v: string | (string | GenericObject<any> | string[])[]
) => {
  if (Array.isArray(v)) {
    let res = v
      .map((item) => {
        if (typeof item === "string") {
          return item;
        } else if (Array.isArray(item)) {
          return item;
        } else if (typeof item === "object" && item.value) {
          return item.value;
        } else {
          return [];
        }
      })
      .flat();
    return { type: "Fields", value: res };
  }
  return { type: "Fields", value: [v] };
};
export const applySelect = ([select, fields, from, table]: [
  GenericObject<string>,
  GenericObject<string[]>,
  GenericObject<string>,
  GenericObject<string>
]) => {
  return {
    type: "Statement",
    value: { type: select.type, fields: fields.value, relation: table.value },
  };
};
