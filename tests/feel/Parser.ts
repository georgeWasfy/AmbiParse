import { alt, apply, lazy, optional, parse, seq } from "../../src/parser";
import {
  LPAREN,
  RPAREN,
  COMMA,
  FUNCTION,
  OR,
  EQUAL,
  GT,
  ADD,
  MUL,
  IDENTIFIER,
  IN,
  ELLIPSIS,
  EOF,
  DIV,
  DOT,
  QUOTE,
  SUB,
  AND,
  LT,
  LE,
  GE,
  NOTEQUAL,
  BETWEEN,
  POW,
  LBRACK,
  RBRACK,
  WS,
  OPS,
  NOT,
  IntegerLiteral,
  FloatingPointLiteral,
  StringLiteral,
  NULL,
  UNDEFINEDVALUE,
  BooleanLiteral,
  FOR,
  RETURN,
  reusableKeywords,
  SOME,
  SATISFIES,
  EVERY,
} from "./Lexer";
import { ScopeManager } from "./Scope";

/**************************
 *   OTHER CONSTRUCTS
 **************************/
//5. OTHER CONSTRUCTS
const endpoint = lazy(() => additiveExpression);

const interval = alt(
  // Case 1: (start..end)
  apply(seq(LPAREN, endpoint, ELLIPSIS, endpoint, RPAREN), ([low, start, _dots, end, up]: any) => ({
    type: "Interval",
    bounds: "()",
    start,
    end,
  })),

  // Case 2: (start..end]
  apply(seq(LPAREN, endpoint, ELLIPSIS, endpoint, RBRACK), ([low, start, _dots, end, up]: any) => ({
    type: "Interval",
    bounds: "(]",
    start,
    end,
  })),

  // Case 3: (start..end[
  apply(seq(LPAREN, endpoint, ELLIPSIS, endpoint, LBRACK), ([low, start, _dots, end, up]: any) => ({
    type: "Interval",
    bounds: "([",
    start,
    end,
  })),

  // Case 4: ]start..end)
  apply(seq(RBRACK, endpoint, ELLIPSIS, endpoint, RPAREN), ([low, start, _dots, end, up]: any) => ({
    type: "Interval",
    bounds: "])",
    start,
    end,
  })),

  // Case 5: ]start..end[
  apply(seq(RBRACK, endpoint, ELLIPSIS, endpoint, LBRACK), ([low, start, _dots, end, up]: any) => ({
    type: "Interval",
    bounds: "][",
    start,
    end,
  })),

  // Case 6: ]start..end]
  apply(seq(RBRACK, endpoint, ELLIPSIS, endpoint, RBRACK), ([low, start, _dots, end, up]: any) => ({
    type: "Interval",
    bounds: "]]",
    start,
    end,
  })),

  // Case 7: [start..end)
  apply(seq(LBRACK, endpoint, ELLIPSIS, endpoint, RPAREN), ([low, start, _dots, end, up]: any) => ({
    type: "Interval",
    bounds: "[)",
    start,
    end,
  })),

  // Case 8: [start..end[
  apply(seq(LBRACK, endpoint, ELLIPSIS, endpoint, LBRACK), ([low, start, _dots, end, up]: any) => ({
    type: "Interval",
    bounds: "[[",
    start,
    end,
  })),

  // Case 9: [start..end]
  apply(seq(LBRACK, endpoint, ELLIPSIS, endpoint, RBRACK), ([low, start, _dots, end, up]: any) => ({
    type: "Interval",
    bounds: "[]",
    start,
    end,
  }))
);

const simplePositiveUnaryTest = alt(
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

  // Interval
  interval
);

const simplePositiveUnaryTests = alt(
  simplePositiveUnaryTest,
  seq(
    COMMA,
    lazy(() => simplePositiveUnaryTest)
  )
);

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

const positiveUnaryTests = apply(
  alt(
    positiveUnaryTest,
    seq(
      COMMA,
      lazy(() => positiveUnaryTest)
    )
  ),
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

/**************************
 *       EXPRESSIONS
 **************************/
// 4. Conditional Or Expression
const parameters = lazy(() => formalParameters);
// more formally nameRefOtherToken should be ~(LPAREN|RPAREN|LBRACK|RBRACK|LBRACE|RBRACE|LT|GT|EQUAL|BANG|COMMA)
// but this will do for now
const nameRefOtherToken = IDENTIFIER;
const nameRef = alt(
  nameRefOtherToken,
  apply(
    seq(
      apply(NOT, (token: any) => {
        // helper.startVariable(token);
        return token;
      }),
      lazy(() => nameRef)
    ),
    ([first, rest]: any) => {
      return first + rest;
    }
  )
);

const qualifiedName = alt(
  apply(nameRef, (name: any) => {
    // helper.recoverScope(name);
    return name;
  }),
  apply(
    seq(
      DOT,
      lazy(() => qualifiedName)
    ),
    ([first, rest]: any) => {
      const qn = [first, ...rest.map(([_, name]: any) => name)];
      // helper.validateVariable({}, qn, qn[qn.length - 1]);
      // rest.forEach(() => helper.dismissScope());
      return qn;
    }
  )
);

const literal = alt(
  apply(IntegerLiteral, (literal: any) => {
    return {
      type: "IntegerLiteral",
      value: literal,
    };
  }),
  apply(FloatingPointLiteral, (literal: any) => {
    return {
      type: "FloatingPointLiteral",
      value: literal,
    };
  }),
  apply(BooleanLiteral, (literal: any) => {
    return {
      type: "BooleanLiteral",
      value: literal,
    };
  }),
  // skip for now
  // apply(atLiteral, (literal: any) => {
  //   return {
  //     type: "atLiteral",
  //     value: literal,
  //   };
  // })
  apply(StringLiteral, (literal: any) => {
    return {
      type: "StringLiteral",
      value: literal,
    };
  }),
  apply(NULL, (literal: any) => {
    return {
      type: "NULL",
      value: literal,
    };
  }),
  apply(UNDEFINEDVALUE, (literal: any) => {
    return {
      type: "UNDEFINEDVALUE",
      value: literal,
    };
  })
);

const iterationNameDefinitionToken = alt(
  IDENTIFIER,
  // additionalNameSymbol,
  IntegerLiteral,
  FloatingPointLiteral,
  reusableKeywords,
  IN,
  lazy(() => iterationNameDefinitionToken)
);
// iterationNameDefinitionTokens parser
const iterationNameDefinitionTokens = alt(
  IDENTIFIER,
  apply(seq(IDENTIFIER, iterationNameDefinitionToken), (tokens: any) => {
    return {
      type: "IterationNameDefinitionTokens",
      tokens,
      ctx: { text: tokens.join("") },
    };
  })
);

// iterationNameDefinition parser
const iterationNameDefinition = apply(iterationNameDefinitionTokens, (tokens: any) => {
  // scope.defineVariable("lll", tokens);
  return tokens;
});
const iterationContext = alt(
  // Enhanced for loop variant (requires feature flag)
  apply(
    seq(
      lazy(() => iterationNameDefinition),
      IN,
      lazy(() => expression),
      ELLIPSIS,
      lazy(() => expression)
    ),
    ([_, name, _in, start, _dots, end]: any) => ({
      type: "EnhancedIteration",
      name,
      start,
      end,
    })
  ),
  // Standard iteration variant
  apply(
    seq(
      lazy(() => iterationNameDefinition),
      IN,
      lazy(() => expression)
    ),
    ([name, _in, expr]: any) => ({
      type: "StandardIteration",
      name,
      expression: expr,
    })
  )
);
const iterationContexts = apply(
  seq(
    iterationContext,
    apply(
      optional(
        apply(seq(COMMA, iterationContext), ([_, ctx]: any) => ctx) // Extract just the context
      ),
      (results: any) => results.flat()
    ) // Flatten nested arrays
  ),
  ([first, rest]: any) => [first, ...rest]
);
const forExpression = apply(
  seq(
    // Push scope at the start of the `for` expression
    apply(FOR, () => {
      // helper.pushScope();
      // return null;
    }),
    iterationContexts, // Parse iteration contexts
    RETURN, // Parse the `return` keyword
    apply(
      lazy(() => expression),
      (expr: any) => {
        // helper.enableDynamicResolution();
        const result = expr;
        // helper.disableDynamicResolution();
        return result;
      }
    )
  ),
  ([_, contexts, _returnKeyword, expr]: any) => {
    // Pop scope after parsing the `for` expression
    // helper.popScope();
    return {
      type: "ForExpression",
      iterationContexts: contexts,
      returnExpression: expr,
    };
  }
);
const quantifiedExpression = alt(
  // SOME case
  apply(
    seq(
      SOME,
      apply(iterationContexts, () => {
        // helper.pushScope();
        return null;
      }),
      SATISFIES,
      apply(
        lazy(() => expression),
        (expr: any) => {
          // helper.enableDynamicResolution();
          const result = expr;
          // helper.disableDynamicResolution();
          // helper.popScope();
          return result;
        }
      )
    ),
    ([_some, _ctx, _sat, expr]: any) => ({
      type: "QuantifiedExpressionSome",
      expression: expr,
    })
  ),

  // EVERY case
  apply(
    seq(
      EVERY,
      apply(iterationContexts, () => {
        // helper.pushScope();
        return null;
      }),
      SATISFIES,
      apply(
        lazy(() => expression),
        (expr: any) => {
          // helper.enableDynamicResolution();
          const result = expr;
          // helper.disableDynamicResolution();
          // helper.popScope();
          return result;
        }
      )
    ),
    ([_every, _ctx, _sat, expr]: any) => ({
      type: "QuantifiedExpressionEvery",
      expression: expr,
    })
  )
);
const expressionList = apply(
  alt(
    lazy(() => expression),
    seq(
      COMMA,
      lazy(() => expressionList)
    )
  ),
  (elements: any) => elements
);
const list = alt(
  apply(seq(LBRACK, RBRACK), () => ({
    type: "EmptyList",
    elements: [],
  })),
  apply(seq(LBRACK, expressionList, RBRACK), ([_lbrack, elements, _rbrack]: any) => ({
    type: "List",
    elements,
  }))
);
const primary = alt(
  // Case 1: literal
  apply(literal, (val: any) => {
    return { type: "PrimaryLiteral", value: val };
  }),

  // Case 2: for expression
  apply(forExpression, (expr: any) => ({
    type: "PrimaryForExpression",
    expression: expr,
  })),

  // Case 3: quantified expression
  apply(quantifiedExpression, (expr: any) => ({
    type: "PrimaryQuantifiedExpression",
    expression: expr,
  })),

  // // Case 4: if expression
  // apply(ifExpression, (expr: any) => ({
  //   type: "PrimaryIfExpression",
  //   expression: expr,
  // })),

  // Case 5: interval
  apply(interval, (i: any) => ({
    type: "PrimaryInterval",
    interval: i,
  })),

  // Case 6: list
  apply(list, (l: any) => ({
    type: "PrimaryList",
    list: l,
  })),

  // // Case 7: context
  // apply(context, (ctx: any) => ({
  //   type: "PrimaryContext",
  //   context: ctx,
  // })),

  // Case 8: parenthesized expression
  apply(
    seq(
      LPAREN,
      lazy(() => expression),
      RPAREN
    ),
    (expr: any) => ({
      type: "PrimaryParens",
      expression: expr,
    })
  ),

  // Case 9: unary test
  apply(simplePositiveUnaryTest, (test: any) => {
    return { type: "PrimaryUnaryTest", test };
  }),

  // Case 10: qualified name
  apply(qualifiedName, (name: any) => ({
    type: "PrimaryName",
    name,
  }))
);
const unaryExpressionNotPlusMinus = alt(
  primary,
  seq(primary, DOT, qualifiedName, parameters),
  seq(primary, DOT, qualifiedName)
);

///////HERE: unaryExpressionNotPlusMinus tested////////////
const unaryExpression = alt(
  apply(
    seq(
      lazy(() => unaryExpression),
      parameters
    ),
    ([name, params]: any) => {
      return {
        type: "FnInvocation",
        name,
        params,
      };
    }
  ),
  apply(
    seq(
      SUB,
      lazy(() => unaryExpression)
    ),
    ([_sub, exp]: any) => {
      return {
        type: "SignedUnaryExpressionMinus",
        sign: _sub,
        exp,
      };
    }
  ),
  unaryExpressionNotPlusMinus,
  seq(ADD, unaryExpressionNotPlusMinus)
);

const filterPathExpression = alt(
  apply(
    seq(
      lazy(() => filterPathExpression),
      LBRACK,
      lazy(() => expression),
      RBRACK
    ),
    ([n0, _lbrack, exp, _rbrack]: any) => {
      return {
        type: "FilterPathExpressionWithBrackets",
        name: n0,
        filter: exp,
      };
    }
  ),
  apply(
    seq(
      lazy(() => filterPathExpression),
      DOT,
      qualifiedName
    ),
    ([n1, _dot, name]: any) => {
      return {
        type: "FilterPathExpressionWithDot",
        name: n1,
        filter: name,
      };
    }
  ),
  unaryExpression
);
const powerExpression = alt(
  filterPathExpression,
  apply(
    seq(
      lazy(() => powerExpression),
      POW,
      filterPathExpression
    ),
    ([left, op, right]: any) => {
      // To handle the case of power ** as the first * will match with MUL symbol
      // TODO: this needs to be recursive and at each level check left and right

      // if (
      //   (typeof left === "string" && OPS.some((op) => left.includes(op))) ||
      //   (typeof right === "string" && OPS.some((op) => right.includes(op)))
      // )
      //   return undefined;
      return {
        type: "PowerExpression",
        operator: op,
        left,
        right,
      };
    }
  )
);
//Note: if in base case I use alt(IDENTIFIER, Integarliteral)
// each expression is repeated twice whuch are exactly the same?? to be habdled
const multiplicativeExpression = alt(
  apply(
    seq(
      lazy(() => multiplicativeExpression),
      alt(MUL, DIV),
      powerExpression
    ),
    ([left, op, right]: any) => {
      // To handle the case of power ** as the first * will match with MUL symbol
      // TODO: this needs to be recursive and at each level check left and right
      // if (
      //   (typeof left === "string" && !OPS.some((op) => left.includes(op))) ||
      //   (typeof right === "string" && !OPS.some((op) => right.includes(op)))
      // )
      //   return undefined;
      return {
        type: "MultiplicativeExpression",
        operator: op,
        left,
        right,
      };
    }
  ),
  powerExpression
);
const additiveExpression = alt(
  apply(
    seq(
      lazy(() => additiveExpression),
      ADD,
      multiplicativeExpression
    ),
    ([left, op, right]: any) => {
      return {
        type: "AdditiveExpression",
        operator: op,
        left,
        right,
      };
    }
  ),
  apply(
    seq(
      lazy(() => additiveExpression),
      SUB,
      multiplicativeExpression
    ),
    ([left, op, right]: any) => {
      return {
        type: "AdditiveExpression",
        operator: op,
        left,
        right,
      };
    }
  ),
  multiplicativeExpression
);
// TODO: InListExpression,InExpression not tested
const relationalExpression = alt(
  apply(
    seq(
      lazy(() => relationalExpression),
      BETWEEN,
      additiveExpression,
      AND,
      additiveExpression
    ),
    ([val, _b, start, _a, end]: any) => ({
      type: "BetweenExpression",
      value: val,
      start,
      end,
    })
  ),
  apply(
    seq(
      lazy(() => relationalExpression),
      IN,
      LPAREN,
      positiveUnaryTests,
      RPAREN
    ),
    ([val, _in, _lparen, tests, _rparen]: any) => ({
      type: "InListExpression",
      value: val,
      tests,
    })
  ),
  apply(
    seq(
      lazy(() => relationalExpression),
      IN,
      lazy(() => expression)
    ),
    ([val, _in, expr]: any) => ({
      type: "InExpression",
      value: val,
      expression: expr,
    })
  ),
  additiveExpression
);
const comparisonExpression = alt(
  apply(
    seq(
      lazy(() => comparisonExpression),
      alt(EQUAL, LT, GT),
      relationalExpression
    ),
    ([left, op, right]: any) => {
      // console.log("🚀 ~ right:", right)
      // console.log("🚀 ~ left:", left)
      // if (
      //   ( OPS.some((op) => left.includes(op))) ||
      //   ( OPS.some((op) => right.includes(op)))
      // )
      //   return undefined;
      return {
        type: "ComparisonExpression",
        operator: op,
        left,
        right,
      };
    }
  ),
  relationalExpression
);
const conditionalAndExpression = alt(
  apply(
    seq(
      lazy(() => conditionalAndExpression),
      AND,
      comparisonExpression
    ),
    ([left, op, right]: any) => {
      return {
        type: "LogicalExpression",
        operator: op,
        left,
        right,
      };
    }
  ),
  comparisonExpression
);

const conditionalOrExpression = alt(
  apply(
    seq(
      lazy(() => conditionalOrExpression),
      OR,
      conditionalAndExpression
    ),
    ([left, op, right]: any) => {
      return {
        type: "LogicalExpression",
        operator: op,
        left,
        right,
      };
    }
  ),
  conditionalAndExpression
);

// 3. Function Parameters
const positionalParameters = apply(
  alt(
    seq(
      IDENTIFIER,
      apply(COMMA, () => {}),
      lazy(() => positionalParameters)
    ),
    IDENTIFIER
  ),
  ([first, ...rest]: any) => {
    return [first, ...(rest.filter((value: any) => value !== undefined) || [])];
  }
);

const formalParameters = alt(
  // Empty parameters
  apply(seq(LPAREN, RPAREN), () => ({
    type: "parameters",
    variant: "empty",
  })),

  // Positional parameters
  apply(seq(LPAREN, positionalParameters, RPAREN), (params: string[]) => {
    return { type: "parameters", variant: "positional", values: params.slice(1, -1) };
  })
);

const functionDefinition = apply(
  seq(
    FUNCTION,
    formalParameters,
    lazy(() => expression)
  ),
  ([, params, body]: any) => ({
    type: "functionDefinition",
    parameters: params,
    body: body,
  })
);

// 2. TextualExpression
// const textualExpression = alt(functionDefinition, conditionalOrExpression);
const textualExpression = conditionalOrExpression;

// 1. Expression Structure
const expression = apply(textualExpression, (expr: any) => {
  if (expr !== undefined)
    return {
      type: "expression",
      value: expr,
    };
});

const exprParser = parse(expression);
const result = exprParser(`orders[status = "pending"].items[quantity > 10]`);
// orders[status = "pending"].items[quantity > 10]
console.log(JSON.stringify(result));

// const exprParser = parse(IntegerLiteral)
// const result = exprParser("te 10");
// console.log(JSON.stringify(result));
