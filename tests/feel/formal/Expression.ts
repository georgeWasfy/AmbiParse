import { alt } from "../../../src/parser";

import { Name, NumericLiteral, StringLiteral } from "./Lexer";

export const expression = alt(Name, NumericLiteral, StringLiteral);
export type Expression = any;
