import { alt, apply, seq, lazy } from "../../src/parser";
import {
  IDENTIFIER,
  NOT,
  DOT,
  IntegerLiteral,
  FloatingPointLiteral,
  BooleanLiteral,
  StringLiteral,
  NULL,
  UNDEFINEDVALUE,
} from "./Lexer";

// more formally nameRefOtherToken should be ~(LPAREN|RPAREN|LBRACK|RBRACK|LBRACE|RBRACE|LT|GT|EQUAL|BANG|COMMA)
// but this will do for now
const nameRefOtherToken = IDENTIFIER; //matchPattern("^[^=><!*.\\[\\]{}()\S]+")
const nameRef = alt(
  nameRefOtherToken,
  apply(
    seq(
      apply(NOT, (token: any) => {
        // helper.startVariable(token);
        return token;
      }),
      lazy(() => nameRef)
    ),
    ([first, rest]: any) => {
      return first + rest;
    }
  )
);

export const qualifiedName = alt(
  apply(nameRef, (name: any) => {
    // helper.recoverScope(name);
    return name;
  }),
  apply(
    seq(
      DOT,
      lazy(() => qualifiedName)
    ),
    ([first, rest]: any) => {
      const qn = [first, ...rest.map(([_, name]: any) => name)];
      // helper.validateVariable({}, qn, qn[qn.length - 1]);
      // rest.forEach(() => helper.dismissScope());
      return qn;
    }
  )
);

export const literal = alt(
  apply(IntegerLiteral, (literal: any) => {
    return {
      type: "IntegerLiteral",
      value: literal,
    };
  }),
  apply(FloatingPointLiteral, (literal: any) => {
    return {
      type: "FloatingPointLiteral",
      value: literal,
    };
  }),
  apply(BooleanLiteral, (literal: any) => {
    return {
      type: "BooleanLiteral",
      value: literal,
    };
  }),
  // skip for now
  // apply(atLiteral, (literal: any) => {
  //   return {
  //     type: "atLiteral",
  //     value: literal,
  //   };
  // })
  apply(StringLiteral, (literal: any) => {
    return {
      type: "StringLiteral",
      value: literal,
    };
  }),
  apply(NULL, (literal: any) => {
    return {
      type: "NULL",
      value: literal,
    };
  }),
  apply(UNDEFINEDVALUE, (literal: any) => {
    return {
      type: "UNDEFINEDVALUE",
      value: literal,
    };
  })
);
