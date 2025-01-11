import { parse } from "../src/parser";
import { select_stmt } from "./sql/Parser";

describe("SQL::simple select", () => {
  const expParser = parse(select_stmt);
    
  it("simple select with field names", () => {
    const result = expParser("SElEcT id,name from Users;")[0].value;
    const expected = {
      type: "Statement",
      value: { type: "SELECT", fields: ["id", "name"], relation: "Users" },
    };
    expect(result).toEqual(expected);
  });

  it("simple select with star", () => {
    const result = expParser("SElEcT * from Users;")[0].value;
    const expected = {
      type: "Statement",
      value: { type: "SELECT", fields: ["*"], relation: "Users" },
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
        fields: [
          { table: "Users", field: "id" },
          { table: "Users", field: "name" },
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
      value: { type: "SELECT", fields: ["Foo"], relation: null },
    };
    expect(result).toEqual(expected);
  });

  it("simple select a number", () => {
    const result = expParser("SElect 0x123ABC ;")[0].value;
    const expected = {
      type: "Statement",
      value: { type: "SELECT", fields: [new Number(0x123ABC)], relation: null },
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
        fields: [
          "hello",
          "sql",
          new Number(1),
          new Number(1.5),
          new Number(1.0e5),
          new Number(0x123ABC),
        ],
        relation: null,
      },
    };
    expect(result).toEqual(expected);
  });
});
