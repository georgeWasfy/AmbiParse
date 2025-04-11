import { parse } from "../../src/parser";
import { expression } from "./Expression";

const exprParser = parse(expression);
const result = exprParser(`some x in [1,2,3] satisfies x > 2`);
// orders[status = "pending"].items[quantity > 10]
console.log(JSON.stringify(result[0]));

// #primaryForExpression
// for x in [1,2,3] return x * 2

// #primaryQuantifiedExpression
// some x in [1,2,3] satisfies x > 2

// #primaryIfExpression
// if x > 5 then "high" else "low"

// #primaryInterval
// [1..10)

// #primaryList
// [1, 2, 3]

// #primaryContext
// { x: 5, y: 10 }

// #primaryParens
// (2 + 3 * 4)

// -{ x: 5 }.x  // Signed context access: #signedUnaryExpressionMinus → #primaryContext
// +[1,2,3][1] // Signed list access: #signedUnaryExpressionPlus → #primaryList
// not(true)() // Function invocation on negation: #fnInvocation → #primaryUnaryTest

// const exprParser = parse(IntegerLiteral)
// const result = exprParser(",");
// console.log(JSON.stringify(result));
