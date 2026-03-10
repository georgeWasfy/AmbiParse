import { alt, apply, lazy, seq } from "../../../src/parser";
import { Expression } from "./Expression";
import { COMMA, ELLIPSIS, GE, GT, LBRACK, LE, LPAREN, LT, RBRACK, RPAREN } from "./Lexer";
import { expression } from "./main";

type Interval = {
  type: "Interval";
  bounds: "()" | "(]" | "([" | "])" | "][" | "]]" | "[)" | "[[" | "[]";
  start: Expression;
  end: Expression;
};
const endpoint = lazy(() => expression);

const interval = alt(
  // Case 1: (start..end)
  apply(
    seq(LPAREN, endpoint, ELLIPSIS, endpoint, RPAREN),
    ([low, start, _dots, end, up]: [string, Expression, string, Expression, string]) => ({
      type: "Interval",
      bounds: "()",
      start,
      end,
    })
  ),

  // Case 2: (start..end]
  apply(
    seq(LPAREN, endpoint, ELLIPSIS, endpoint, RBRACK),
    ([low, start, _dots, end, up]: [string, Expression, string, Expression, string]) => ({
      type: "Interval",
      bounds: "(]",
      start,
      end,
    })
  ),

  // Case 3: (start..end[
  apply(
    seq(LPAREN, endpoint, ELLIPSIS, endpoint, LBRACK),
    ([low, start, _dots, end, up]: [string, Expression, string, Expression, string]) => ({
      type: "Interval",
      bounds: "([",
      start,
      end,
    })
  ),

  // Case 4: ]start..end)
  apply(
    seq(RBRACK, endpoint, ELLIPSIS, endpoint, RPAREN),
    ([low, start, _dots, end, up]: [string, Expression, string, Expression, string]) => ({
      type: "Interval",
      bounds: "])",
      start,
      end,
    })
  ),

  // Case 5: ]start..end[
  apply(
    seq(RBRACK, endpoint, ELLIPSIS, endpoint, LBRACK),
    ([low, start, _dots, end, up]: [string, Expression, string, Expression, string]) => ({
      type: "Interval",
      bounds: "][",
      start,
      end,
    })
  ),

  // Case 6: ]start..end]
  apply(
    seq(RBRACK, endpoint, ELLIPSIS, endpoint, RBRACK),
    ([low, start, _dots, end, up]: [string, Expression, string, Expression, string]) => ({
      type: "Interval",
      bounds: "]]",
      start,
      end,
    })
  ),

  // Case 7: [start..end)
  apply(
    seq(LBRACK, endpoint, ELLIPSIS, endpoint, RPAREN),
    ([low, start, _dots, end, up]: [string, Expression, string, Expression, string]) => ({
      type: "Interval",
      bounds: "[)",
      start,
      end,
    })
  ),

  // Case 8: [start..end[
  apply(
    seq(LBRACK, endpoint, ELLIPSIS, endpoint, LBRACK),
    ([low, start, _dots, end, up]: [string, Expression, string, Expression, string]) => ({
      type: "Interval",
      bounds: "[[",
      start,
      end,
    })
  ),

  // Case 9: [start..end]
  apply(
    seq(LBRACK, endpoint, ELLIPSIS, endpoint, RBRACK),
    ([low, start, _dots, end, up]: [string, Expression, string, Expression, string]) => ({
      type: "Interval",
      bounds: "[]",
      start,
      end,
    })
  )
);
// export const positiveUnaryTest = lazy(() => expression);
// export const positiveUnaryTests = alt(
//   apply(positiveUnaryTest, (exp: Expression) => [[exp]]),
//   apply(
//     seq(
//       positiveUnaryTest,
//       COMMA,
//       lazy(() => positiveUnaryTests)
//     ),
//     ([exp1, _comma, exp2]: [Expression, string, Expression]) => {
//       return Array.isArray(exp2) ? [[exp1, ...exp2]] : [[exp1, exp2]];
//     }
//   )
// );
export const simplePositiveUnaryTest = alt(
  apply(seq(alt(LT, LE, GT, GE), endpoint), ([op, exp]: [string, Expression]) => {
    return {
      type: "SimplePositiveUnaryTest",
      variant: "Compare",
      CompareOP: op,
      expression: exp,
    };
  }),
  apply(interval, (interval: Interval) => {
    return {
      type: "SimplePositiveUnaryTest",
      variant: "interval",
      expression: interval,
    };
  })
);
export const simplePositiveUnaryTests = alt(
  apply(simplePositiveUnaryTest, (exp: Expression) => [[exp]]),
  apply(
    seq(
      simplePositiveUnaryTest,
      COMMA,
      lazy(() => simplePositiveUnaryTests)
    ),
    ([exp1, _comma, exp2]: [Expression, string, Expression]) => {
      return Array.isArray(exp2) ? [[exp1, ...exp2]] : [[exp1, exp2]];
    }
  )
);

// export const unaryTests = alt(
//   apply(positiveUnaryTests, (tests: Expression[]) => {
//     return {
//       type: "UnaryTests",
//       kind: "positive",
//       tests: tests[0],
//     };
//   }),
//   apply(
//     seq(NOT, LPAREN, positiveUnaryTests, RPAREN),
//     ([_not, _lparen, tests, _rparen]: [string, string, Expression[], string]) => {
//       return {
//         type: "UnaryTests",
//         kind: "negative",
//         tests: tests,
//       };
//     }
//   ),
//   apply(SUB, () => {
//     return {
//       type: "UnaryTests",
//       kind: "dash",
//     };
//   })
// );

/**********************************
 * Unary Tests EXAMPLES            *
 **********************************/
// Case 13a: Positive Unary Tests
// 1. 1,2,3
// 2. 5.5,10.1

// Case 13b: Negative Unary Tests
// 1. not (1)
// 2. not (1,2,3)
// 3. not (-5,5)

// Case 13c: Dash Unary Test
// 1. -

/**********************************
 * Edge Case EXAMPLES              *
 **********************************/
// 1.  (empty input - should error)
// 2. not () (empty parentheses - should error)
// 3. not (1,2 (missing closing paren)
// 4. 1,,2 (double comma)
// 5. -1 (dash with number - currently errors per spec)
// 6. not (1 2) (missing comma between numbers)
// 7. not 1 (missing parentheses)

/*******************************************************
 * Simple Positive Unary Test EXAMPLES *
 *******************************************************/

// VALID COMPARISON OPERATORS (Rule 7a)
// 1. <5
// 2. <=-10.5
// 3. >3.14159
// 4. >=0

// VALID INTERVALS (Rule 7b)
// Standard Forms
// 5. [1..5]     → closed-closed
// 6. [1..5)     → closed-open
// 7. (1..5]     → open-closed
// 8. ]1..5[     → open-open (unconventional)

// Alternative Valid Forms
// 9. ]1..5]     → open-closed (start with ])
// 10. [1..5[    → closed-open (end with [)
// 11. (1..5)    → open-open
// 12. ]1..5)    → open-open (mixed)

// Number Format Variants
// 13. <1e3      → scientific notation
// 14. >=-0.0    → signed zero
// 15. [1.5..5.5]→ decimal bounds
// 16. ]-10..10[ → negative start

// INVALID CASES
// 17. 5         → missing operator/brackets
// 18. <         → missing endpoint
// 19. [1..5     → missing end bracket
// 20. 1..5]     → missing start bracket
// 21. [1..]     → missing end value
// 22. ..5]      → missing start value
// 23. ()        → empty interval
// 24. (5..1)    → reversed range (syntax valid but logical error)
// 25. [NaN..5]  → invalid number format
// 26. <=        → operator without value
// 27. [1..5)    → extra space between '5' and ')'
// 28. < 5       → space after operator (valid if lexer handles whitespace)
// 29. [1....5]  → extra dots
// 30. [1..5[)   → mismatched brackets

// BOUNDARY CASES
// 31. [1..1]    → single-point closed
// 32. (1..1)    → empty open interval
// 33. ]1..1]    → single-point at end
// 34. [1..1[    → empty at start
