/**************************
 *   OTHER CONSTRUCTS
 **************************/

import { alt, apply, seq, lazy } from "../../src/parser";
import { interval } from "./BranchesAndIteration";
import { additiveExpression, expression } from "./Expression";
import { LT, GT, EQUAL, COMMA, NOT, LPAREN, RPAREN, SUB, EOF } from "./Lexer";

//5. OTHER CONSTRUCTS
export const endpoint = lazy(()=>additiveExpression);

export const simplePositiveUnaryTest = alt(
  // Inequality intervals
  apply(seq(LT, endpoint), ([op, end]: any) => {
    // helper.enableDynamicResolution();
    const result = { type: "InequalityInterval", operator: op, endpoint: end };
    // helper.disableDynamicResolution();
    return result;
  }),

  apply(seq(GT, endpoint), ([op, end]: any) => {
    // helper.enableDynamicResolution();
    const result = { type: "InequalityInterval", operator: op, endpoint: end };
    // helper.disableDynamicResolution();
    return result;
  }),

  // Equality tests
  apply(seq(EQUAL, endpoint), ([op, end]: any) => {
    // helper.enableDynamicResolution();
    const result = { type: "EqualityTest", operator: op, endpoint: end };
    // helper.disableDynamicResolution();
    return result;
  }),

  interval
);

const simplePositiveUnaryTests = alt(simplePositiveUnaryTest, seq(COMMA, simplePositiveUnaryTest));

const simpleUnaryTests = alt(
  // Positive tests
  simplePositiveUnaryTests,

  // Negated tests
  apply(
    seq(NOT, LPAREN, simplePositiveUnaryTests, RPAREN),
    ([_not, _lparen, tests, _rparen]: any) => ({
      type: "NegatedTests",
      tests,
    })
  ),

  // Empty test (dash)
  apply(SUB, () => ({ type: "EmptyTest" }))
);

const positiveUnaryTest = lazy(() => expression);

export const positiveUnaryTests = apply(
  alt(positiveUnaryTest, seq(COMMA, positiveUnaryTest)),
  (x: any) => {
    console.log(x);
  }
);

const unaryTests = alt(
  apply(seq(NOT, LPAREN, positiveUnaryTests, RPAREN), ([_not, _lparen, tests, _rparen]: any) => ({
    type: "NegatedUnaryTests",
    tests,
  })),
  positiveUnaryTests,
  apply(SUB, () => ({ type: "EmptyTest" }))
);

const unaryTestsRoot = seq(unaryTests, EOF);
