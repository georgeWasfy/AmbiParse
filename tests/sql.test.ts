import { parse } from "../src/parser";
import { select_stmt } from "./sql/Parser";

describe("SQL::simple select", () => {
  const expParser = parse(select_stmt);
    
  it("simple select with field names", () => {
    const result = expParser("SElEcT id,name from Users")[0].value;
    const expected = {
      type: "Statement",
      value: { type: "SELECT", fields: ["id", "name"], relation: "Users" },
    };
    expect(result).toEqual(expected);
  });
    
  it("simple select with star", () => {
    const result = expParser("SElEcT * from Users")[0].value;
    const expected = {
      type: "Statement",
      value: { type: "SELECT", fields: ["*"], relation: "Users" },
    };
    expect(result).toEqual(expected);
  });
    
  it("simple select with Dot notation for fields", () => {
    const result = expParser("SElect Users.id, Users.name from Users")[0].value;
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
});
