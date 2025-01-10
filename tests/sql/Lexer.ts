import { alt, apply, match, matchPattern, seq } from "../../src/parser";

type GenericObject<T> = {
  type: string;
  value: T;
};

export const STAR = match("*");
export const DOT = match(".");
export const COMMA = match(",");

export const IDENTIFIER = matchPattern("^([a-zA-Z_$][a-zA-Z0-9_$]*)");

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
