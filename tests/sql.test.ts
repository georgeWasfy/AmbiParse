import { parse } from "../src/parser";
import { select_stmt } from "./sql/Parser";

describe("SQL::simple select", () => {
  const expParser = parse(select_stmt);
    
  it("simple select with field names", () => {
    const result = expParser("SElEcT id,name from Users;")[0].value;
    const expected = {
      type: "Statement",
      value: {
        type: "SELECT",
        expressions: [
          { type: "FIELD_expr", value: "name" },
          { type: "FIELD_expr", value: "id" },
        ],
        relation: "Users",
      },
    };
    expect(result).toEqual(expected);
  });

  it("simple select with star", () => {
    const result = expParser("SElEcT * from Users;")[0].value;
    const expected = {
      type: "Statement",
      value: {
        type: "SELECT",
        expressions: [{ type: "FIELD_expr", value: "*" }],
        relation: "Users",
      },
    };
    expect(result).toEqual(expected);
  });

  it("simple select with Dot notation for fields", () => {
    const result = expParser("SElect Users.id, Users.name from Users;")[0]
      .value;
    const expected = {
      type: "Statement",
      value: {
        type: "SELECT",
        expressions: [
          { type: "DOT_expr", value: { table: "Users", field: "name" } },
          { type: "DOT_expr", value: { table: "Users", field: "id" } },
        ],
        relation: "Users",
      },
    };
    expect(result).toEqual(expected);
  });

  it("simple select a string", () => {
    const result = expParser("SElect 'Foo' ;")[0].value;
    const expected = {
      type: "Statement",
      value: {
        type: "SELECT",
        expressions: [{ type: "STRING", value: "Foo" }],
        relation: null,
      },
    };
    expect(result).toEqual(expected);
  });

  it("simple select a number", () => {
    const result = expParser("SElect 0x123ABC ;")[0].value;
    const expected = {
      type: "Statement",
      value: {
        type: "SELECT",
        expressions: [{ type: "NUMBER", value: new Number(0x123abc) }],
        relation: null,
      },
    };
    expect(result).toEqual(expected);
  });

  it("simple select multiple constants", () => {
    const result = expParser(
      "SElect 'hello', 'sql', 1 ,1.5,1.0e5, 0x123ABC ;"
    )[0].value;
    const expected = {
      type: "Statement",
      value: {
        type: "SELECT",
        expressions: [
          { type: "NUMBER", value: new Number(0x123abc) },
          { type: "NUMBER", value: new Number(1.0e5) },
          { type: "NUMBER", value: new Number(1.5) },
          { type: "NUMBER", value: new Number(1) },
          { type: "STRING", value: "sql" },
          { type: "STRING", value: "hello" },
        ],
        relation: null,
      },
    };
    expect(result).toEqual(expected);
  });
});
