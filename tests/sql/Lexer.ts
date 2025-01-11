import { alt, apply, match, matchPattern, seq } from "../../src/parser";

type GenericObject<T> = {
  type: string;
  value: T;
};

export const STAR = match("*");
export const DOT = match(".");
export const COMMA = match(",");
export const SINGLE_QUOTE = match("'");
export const SEMICOLON = match(";");

export const IDENTIFIER = matchPattern("^([a-zA-Z_$][a-zA-Z0-9_$]*)");
export const DIGIT = "[0-9]";
export const HEX_DIGIT = "[0-9A-Fa-f]";

export const NUMERIC_LITERAL = apply(
  alt(
    matchPattern(`^0x${HEX_DIGIT}+`),
    matchPattern(
      `^[-+]?(${DIGIT}+(?:\\.{DIGIT}*)?(?:[Ee][-+]?${DIGIT}+)?|\\.{DIGIT}+(?:[Ee][-+]?${DIGIT}+)?)`
    )
  ),
  (s: string) => {
    return { type: "NUMBER", value: new Number(s) };
  }
);
export const STRING_LITERAL = apply(
  seq(SINGLE_QUOTE, IDENTIFIER, SINGLE_QUOTE),
  ([_, s, __]: [string, string, string]) => {
    return { type: "STRING", value: s };
  }
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

export const applyDot = ([table, dot, field]: [
  GenericObject<string>,
  string,
  string
]) => {
  return { type: "DOT", value: { table: table.value, field } };
};

export const applyFields = (
  v: GenericObject<any> | string | (string | GenericObject<any> | string[])[]
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
  return { type: "Fields", value: [typeof v === "object" ? v.value : v] };
};
export const applySelect = ([select, fields, from, table]: [
  GenericObject<string>,
  GenericObject<string[]>,
  GenericObject<string>,
  GenericObject<string>
]) => {
  return {
    type: "Statement",
    value: { type: select.type, fields: fields.value, relation: table?.value ?? null },
  };
};
