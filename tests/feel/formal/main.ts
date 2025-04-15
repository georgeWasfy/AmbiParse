import { alt, parse } from "../../../src/parser";
import { functionDefinition } from "./FunctionDefinition";
import { context } from "./Context";
import { forExpression, ifExpression, list, quantifiedExpression } from "./BranchesAndIterations";
import { simplePositiveUnaryTest, unaryTests } from "./UnaryTest";
import { arithmeticExpression } from "./Expression";

export const boxedExpression = alt(functionDefinition, context, list);
const exprParser = parse(arithmeticExpression);
const result = exprParser(`- 2`);
console.log(JSON.stringify(result));
