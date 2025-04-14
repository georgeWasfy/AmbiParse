import { alt, parse } from "../../../src/parser";
import { functionDefinition } from "./FunctionDefinition";
import { context } from "./Context";
import { forExpression, ifExpression, list, quantifiedExpression } from "./BranchesAndIterations";

export const boxedExpression = alt(functionDefinition, context, list);
const exprParser = parse(quantifiedExpression);
const result = exprParser(`some x in 1, y in 10, z in 4 satisfies 2`);
console.log(JSON.stringify(result));
