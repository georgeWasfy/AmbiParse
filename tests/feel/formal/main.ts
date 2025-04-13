import { parse } from "../../../src/parser";
import {boxedExpression } from "./FunctionDefinition";


const exprParser = parse(boxedExpression);
const result = exprParser(`[1,2,3]`);
console.log(JSON.stringify(result));
