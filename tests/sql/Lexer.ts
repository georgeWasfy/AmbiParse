import { alt, apply, match, matchPattern, seq } from "../../src/parser";

type GenericObject<T> = {
  type: string;
  value: T;
};

export const STAR = apply(match("*"), (field: string) => {
  return { type: "FIELD_expr", value: field };
});
export const DOT = match(".");
export const COMMA = match(",");
export const SINGLE_QUOTE = match("'");
export const SEMICOLON = match(";");

export const IDENTIFIER = matchPattern("^([a-zA-Z_$][a-zA-Z0-9_$]*)");
export const DIGIT = "[0-9]";
export const HEX_DIGIT = "[0-9A-Fa-f]";

export const NUMERIC_LITERAL = apply(
  alt(
    matchPattern(`^0x${HEX_DIGIT}+`), //HEX
    matchPattern(`^[-+]?${DIGIT}+(?:[Ee][-+]?${DIGIT}+)?`), //int With Exponent
    matchPattern(`^[-+]?${DIGIT}+\.${DIGIT}*(?:[Ee][-+]?${DIGIT}+)?`), //decimal With Exponent
    matchPattern(`^[-+]?\.${DIGIT}+(?:[Ee][-+]?${DIGIT}+)?`) //decimal Starting With Dot
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
const groupFieldsBy = (v: GenericObject<any>[], s:string) => {
  const expressionsObj = v.find((item) => item && item.type === s);

  if (expressionsObj) {
    const otherElements = v.filter(
      (item) => item !== expressionsObj && item !== undefined
    );

    if (expressionsObj.value) {
      otherElements.forEach((element) => {
        if (
          !expressionsObj.value.some(
            (val: any) => JSON.stringify(val) === JSON.stringify(element)
          )
        ) {
          expressionsObj.value.push(element);
        }
      });
    } else {
      expressionsObj.value = otherElements;
    }
  }

  return expressionsObj;
};
export const applyTable = (table: string) => {
  return { type: "TABLE_expr", value: table };
};

export const applyField = (field: string) => {
  return { type: "FIELD_expr", value: field };
};

export const applyDot = ([table, dot, field]: [
  GenericObject<string>,
  string,
  string
]) => {
  return { type: "DOT_expr", value: { table: table.value, field } };
};

export const applyExpressions = (
  v: GenericObject<any> | GenericObject<any>[]
) => {
  if (Array.isArray(v)) return groupFieldsBy(v,'expressions')
  return { type: "expressions", value: [v] };
};

export const applySelect = ([select, fields, from, table]: [
  GenericObject<string>,
  GenericObject<string[]>,
  GenericObject<string>,
  GenericObject<string>
]) => {
  return {
    type: "Statement",
    value: {
      type: select.type,
      expressions: fields.value,
      relation: table?.value ?? null,
    },
  };
};
