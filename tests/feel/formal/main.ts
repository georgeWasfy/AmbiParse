import { alt, parse } from "../../../src/parser";
import { functionDefinition } from "./FunctionDefinition";
import { context } from "./Context";
import { forExpression, ifExpression, list } from "./BranchesAndIterations";

export const boxedExpression = alt(functionDefinition, context, list);
const exprParser = parse(ifExpression);
const result = exprParser(`if 1 then 2 else 3`);
console.log(JSON.stringify(result));
