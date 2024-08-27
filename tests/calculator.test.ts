import {
  alt,
  apply,
  lazy,
  match,
  matchPattern,
  parse,
  seq,
} from "../src/parser";
import * as assert from "assert";

const NUMBERS = matchPattern(`^\\d+(\\.\\d+)?`);
const ADD = match("+");
const SUB = match("-");
const MUL = match("*");
const DIV = match("/");
const LPAREN = match("(");
const RPAREN = match(")");

function applyNumber(value: string): number {
  return +value;
}

function applyFactor(value: [string, number, string]): number {
  return value[1];
}

function applyUnary(value: [string, number]): number {
  switch (value[0]) {
    case "+":
      return +value[1];
    case "-":
      return -value[1];
    default:
      throw new Error(`Unknown unary operator: ${value[0]}`);
  }
}

function applyBinary(value: [number, string, number]): number {
  switch (value[1]) {
    case "+":
      return value[0] + value[2];
    case "-":
      return value[0] - value[2];
    case "*":
      return value[0] * value[2];
    case "/":
      return value[0] / value[2];
    default:
      throw new Error(`Unknown binary operator`);
  }
}

/*
TERM
  = NUMBER
  = ('+' | '-') TERM
  = '(' EXP ')'
*/
const TERM = alt(
  apply(NUMBERS, applyNumber),
  apply(
    seq(
      alt(ADD, SUB),
      lazy(() => TERM)
    ),
    applyUnary
  ),
  apply(
    seq(
      LPAREN,
      lazy(() => EXP),
      RPAREN
    ),
    applyFactor
  )
);

/*
FACTOR
  = TERM
  = FACTOR ('*' | '/') TERM
*/
const FACTOR = alt(
  TERM,
  apply(
    seq(
      lazy(() => FACTOR),
      alt(MUL, DIV),
      TERM
    ),
    applyBinary
  )
);

// EXP
//   = FACTOR
//   = EXP ('+' | '-') FACTOR
// */

const EXP = alt(
  FACTOR,
  apply(
    seq(
      lazy(() => EXP),
      alt(ADD, SUB),
      FACTOR
    ),
    applyBinary
  )
);

const calcParser = parse(EXP);

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
