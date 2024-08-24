import { alt, apply, match, matchPattern, parse, seq } from "../src/parser";
import * as assert from "assert";
const altParser = alt();
const seqParser = seq();
const matchParser = match();
const matchInParser = matchPattern();
const applyParser = apply();

const NUMBERS = matchInParser(`^\\d+(\\.\\d+)?`);
const ADD = matchParser("+");
const SUB = matchParser("-");
const MUL = matchParser("*");
const DIV = matchParser("/");
const LPAREN = matchParser("(");
const RPAREN = matchParser(")");

function applyNumber(value: string): number {
  return +value;
}

function applyFactor(value: [string, number, string]): number {
  return value[1];
}

function applyBinary(value: [number, string, number]): number {
  switch (value[1]) {
    case '+':
      return value[0] + value[2];
    case '-':
      return value[0] - value[2];
    case '*':
      return value[0] * value[2];
    case '/':
        return value[0] / value[2];
    default:
      throw new Error(`Unknown binary operator`);
  }
}
//  GRAMMAR
// expr -> expr "+" term
// | expr "-" term
// | term

// term -> term "*" factor
// | term "/" factor
// | factor

// factor -> "(" expr ")"
// | num

const expr_parser = altParser(
  () =>
    applyParser(
      () =>
        seqParser(
          () => expr_parser,
          () => ADD,
          () => term_parser
        ),
      applyBinary
    ),
  () =>
    applyParser(
      () =>
        seqParser(
          () => expr_parser,
          () => SUB,
          () => term_parser
        ),
      applyBinary
    ),
  () => term_parser
);

const term_parser = altParser(
  () =>
    applyParser(
      () =>
        seqParser(
          () => term_parser,
          () => MUL,
          () => factor_parser
        ),
      applyBinary
    ),
  () =>
    applyParser(
      () =>
        seqParser(
          () => term_parser,
          () => DIV,
          () => factor_parser
        ),
      applyBinary
    ),
  () => factor_parser
);

const factor_parser = altParser(
  () =>
    applyParser(
      () =>
        seqParser(
          () => LPAREN,
          () => expr_parser,
          () => RPAREN
        ),
      applyFactor
    ),
  () => applyParser(() => NUMBERS, applyNumber)
);

const calcParser = parse(expr_parser);

test(`Parser: calculator`, () => {
  assert.strictEqual(calcParser("1")[0].value, 1);
  assert.strictEqual(calcParser("1.5")[0].value, 1.5);
  assert.strictEqual(calcParser("1 + 2")[0].value, 3);
  assert.strictEqual(calcParser("1 - 2")[0].value, -1);
  assert.strictEqual(calcParser("1 * 2")[0].value, 2);
  assert.strictEqual(calcParser("1 / 2")[0].value, 0.5);
  assert.strictEqual(calcParser("1 + 2 * 3 + 4")[0].value, 11);
  assert.strictEqual(calcParser("(1 + 2) * (3 + 4)")[0].value, 21);
});
