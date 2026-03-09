import { alt, parse } from "../../../src/parser";
import { functionDefinition } from "./FunctionDefinition";
import { context } from "./Context";
import { list } from "./BranchesAndIterations";
import { textualExpression } from "./Expression";

const boxedExpression = alt(functionDefinition, context, list);

export const expression = alt(boxedExpression, textualExpression);

const exprParser = parse(expression);

const tests = [
  "1 + 2",
  "1 = 2",
  "1 < 2",
  "1 and 2",
  "1 or 2",
  "a.b",
  "a[0]",
  "x instance of string",
  "1 between 2 and 3",
  "1 in (< 5)", // this fails with []..
  "for x in 1..5 return x",
  "if true then 1 else 2",
  "some x in 1 satisfies x > 0",
  "[1, 2, 3]",
  "{a: 1}",
  "function(x) x + 1",
];

for (const test of tests) {
  console.log(`\n=== Testing: ${test} ===`);
  const result = exprParser(test);
  console.log(JSON.stringify(result, null, 2));
}
