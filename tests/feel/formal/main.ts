import { alt, parse } from "../../../src/parser";
import { functionDefinition } from "./FunctionDefinition";
import { context } from "./Context";
import { list } from "./BranchesAndIterations";

export const boxedExpression = alt(functionDefinition, context, list);
const exprParser = parse(boxedExpression);
const result = exprParser(`{}`);
console.log(JSON.stringify(result));
