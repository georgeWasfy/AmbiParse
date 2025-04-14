import { alt, parse } from "../../../src/parser";
import { functionDefinition } from "./FunctionDefinition";
import { context } from "./Context";
import { forExpression, ifExpression, list, quantifiedExpression } from "./BranchesAndIterations";
import { simplePositiveUnaryTest, unaryTests } from "./UnaryTest";

export const boxedExpression = alt(functionDefinition, context, list);
const exprParser = parse(simplePositiveUnaryTest);
const result = exprParser(`[1..1] `);
console.log(JSON.stringify(result));
