import { alt, apply, lazy, match, seq } from "../../../src/parser";
import { expression } from "./Expression";
import {
  COLON,
  COMMA,
  CONTEXT,
  DOT,
  EXTERNAL,
  FUNCTION,
  GT,
  LIST,
  LPAREN,
  LT,
  Name,
  RANGE,
  RPAREN,
} from "./Lexer";
import { Expression } from "./main";

type Type = {
  kind: "qualified" | "range" | "list" | "context" | "function";
  value: string | Type;
};

type ContextEntryType = {
  name: string;
  type: Type;
};
export type FunctionDefinition =  {
  type: "FunctionDefinition";
  parameters: Array<{ name: string; type: Type | null }>;
  body: Expression;
  external: boolean;
}

type ParameterName = { type: "ParameterName"; name: string };
type NamedParameter = { type: "NamedParameter"; name: ParameterName; value: Expression };
type FormalParameter = { name: string; type: Type | null };

const parameterName = apply(Name, (name: string) => {
  return { type: "ParameterName", name };
});
const namedParameters = alt(
  apply(
    seq(
      parameterName,
      COLON,
      lazy(() => expression)
    ),
    ([param, _colon, exp]: [ParameterName, string, Expression]) => {
      return { type: "NamedParameter", name: param, value: exp };
    }
  ),

  apply(
    seq(
      apply(
        seq(
          parameterName,
          COLON,
          lazy(() => expression)
        ),
        ([param, _colon, exp]: [ParameterName, string, Expression]) => {
          return { type: "NamedParameter", name: param, value: exp };
        }
      ),
      COMMA,
      lazy(() => namedParameters)
    ),
    (params: (string | NamedParameter)[]) => {
      return params.filter((x) => x !== ",");
    }
  )
);

const positionalParameters = alt(
  lazy(() => expression),
  apply(
    seq(
      lazy(() => expression),
      COMMA,
      lazy(() => positionalParameters)
    ),
    (params: (string | Expression)[]) => params.filter((x) => x !== ",")
  )
);
// TODO: Should handle function invocations without params
export const parameters = alt(
  apply(seq(LPAREN, positionalParameters, RPAREN), (params: (string | Expression)[]) => {
    return { type: "PositionalParameters", value: params.slice(1, -1) };
  }),
  apply(seq(LPAREN, namedParameters, RPAREN), (params: (string | NamedParameter)[]) => {
    return { type: "NamedParameters", value: params.slice(1, -1) };
  })
);
export const functionInvocation = seq(
  lazy(() => expression),
  parameters
);
//======================
const qualifiedName = alt(
  Name,
  seq(
    Name,
    DOT,
    lazy(() => qualifiedName)
  )
);
const contextEntryTypes = alt(
  apply(
    seq(
      Name,
      COLON,
      lazy(() => type)
    ),
    ([name, _, type]: [string, string, Type]) => [{ name, type }]
  ),
  apply(
    seq(
      apply(
        seq(
          Name,
          COLON,
          lazy(() => type)
        ),
        ([name, _, type]: [string, string, Type]) => [{ name, type }]
      ),
      COMMA,
      lazy(() => contextEntryTypes)
    ),
    (ctxTypes: (string | ContextEntryType)[]) => {
      return ctxTypes.filter((x) => x !== ",");
    }
  )
);
const innerFunctionTypes = alt(
  lazy(() => type),
  seq(
    lazy(() => type),
    COMMA,
    lazy(() => innerFunctionTypes)
  )
);
const type = alt(
  apply(qualifiedName, (name: string) => ({ kind: "qualified", value: name })),
  apply(
    seq(
      RANGE,
      LT,
      lazy(() => type),
      GT
    ),
    ([_range, _lt, innerType, _gt]: [string, string, Type, string]) => ({
      kind: "range",
      value: innerType,
    })
  ),
  apply(
    seq(
      LIST,
      LT,
      lazy(() => type),
      GT
    ),
    ([_list, _lt, innerType, _gt]: [string, string, Type, string]) => ({
      kind: "list",
      value: innerType,
    })
  ),
  apply(seq(CONTEXT, LT, contextEntryTypes, GT), (fields: [string, string, Type, string]) => {
    return {
      kind: "context",
      value: fields.slice(2, -1),
    };
  }),
  apply(
    seq(
      FUNCTION,
      LT,
      innerFunctionTypes,
      GT,
      match("->"),
      lazy(() => type)
    ),
    (params: (string | Type)[]) => {
      let p = params.filter((x: string | Type) => x !== ",");
      return {
        kind: "function",
        value: {
          params: p.slice(2, -3),
          returnType: p[params.length - 1],
        },
      };
    }
  ),
  apply(
    seq(
      FUNCTION,
      LT,
      GT,
      match("->"),
      lazy(() => type)
    ),
    ([_func, _lt, _gt, _, returnType]: [string, string, string, string, Type]) => ({
      kind: "function",
      value: { params: [], returnType },
    })
  )
);
const formalParameter = alt(
  apply(parameterName, (name: string) => ({ name, type: null })),
  apply(seq(parameterName, COLON, type), ([name, _, type]: [string, string, Type]) => ({
    name,
    type,
  }))
);
const formalParameters = alt(
  apply(formalParameter, (param: FormalParameter) => param),
  seq(
    formalParameter,
    COMMA,
    lazy(() => formalParameters)
  )
);

// TODO: handle Function with Default Values (not included in formal specifications)
// but nice to have
export const functionDefinition = alt(
  apply(
    seq(
      FUNCTION,
      LPAREN,
      RPAREN,
      lazy(() => expression)
    ),
    ([_func, _lp, _rp, body]: (string | Expression)[]) => ({
      type: "FunctionDefinition",
      parameters: [],
      body,
      external: false,
    })
  ),
  apply(
    seq(
      FUNCTION,
      LPAREN,
      RPAREN,
      EXTERNAL,
      lazy(() => expression)
    ),
    ([_func, _lp, _rp, _ext, body]: (string | Expression)[]) => ({
      type: "FunctionDefinition",
      parameters: [],
      body,
      external: true,
    })
  ),
  apply(
    seq(
      FUNCTION,
      LPAREN,
      formalParameters,
      RPAREN,
      lazy(() => expression)
    ),
    (params: (string | Expression | FormalParameter)[]) => {
      return {
        type: "FunctionDefinition",
        parameters: params
          .slice(2, -2)
          .filter((x: string | Expression | FormalParameter) => x !== ","),
        body: params[params.length - 1],
        external: false,
      };
    }
  ),
  apply(
    seq(
      FUNCTION,
      LPAREN,
      formalParameters,
      RPAREN,
      EXTERNAL,
      lazy(() => expression)
    ),
    ([_func, _lp, params, _rp, _ext, body]: (string | Expression | FormalParameter)[]) => ({
      type: "FunctionDefinition",
      parameters: params,
      body,
      external: true,
    })
  )
);

/********************************
 * FUNCTION DEFINITION EXAMPLES *
 ********************************/
// 1. Function with Positional Parameters and Explicit Types
// function(a: number, b: number) a + b
// Example Usage: myFunction(3, 5) // Returns 8

// 2. Function with Named Parameters and Explicit Types
// function(x: string, y: string) concat(x, " ", y)
// Example Usage: myFunction(x: "Hello", y: "World") // Returns "Hello World"

// 3. Function with a List Parameter
// function(numbers: list<number>) sum(numbers)
// Example Usage: myFunction([1, 2, 3, 4]) // Returns 10

// 4. Function with Context Parameter
// function(person: context<name: string, age: number>) person.name + " is " + string(person.age) + " years old"
// Example Usage: myFunction({name: "Alice", age: 30}) // Returns "Alice is 30 years old"

// 5. Function with Date Parameter
// function(startDate: date, endDate: date) days between(startDate, endDate)
// Example Usage: myFunction(date("2025-04-01"), date("2025-04-12")) // Returns 11

// 6. Function with Boolean Parameter
// function(isEnabled: boolean) if isEnabled then "Enabled" else "Disabled"
// Example Usage: myFunction(true) // Returns "Enabled"
// Example Usage: myFunction(false) // Returns "Disabled"

// 7. Function with Mixed Types
// function(name: string, age: number, isMember: boolean)
//     if isMember then name + " (age " + string(age) + ") is a member" else name + " is not a member"
// Example Usage: myFunction(name: "John", age: 25, isMember: true) // Returns "John (age 25) is a member"
// Example Usage: myFunction(name: "Jane", age: 30, isMember: false) // Returns "Jane is not a member"

// 8. Function with Default Values
// function(a: number = 10, b: number = 20) a * b
// Example Usage: myFunction() // Returns 200 (default values used)
// Example Usage: myFunction(5, 4) // Returns 20 (provided values used)

// 9. Recursive Function
// function factorial(n: number) if n = 0 then 1 else n * factorial(n - 1)
// Example Usage: factorial(5) // Returns 120 (5 * 4 * 3 * 2 * 1)

// 10. Function Returning Complex Types
// function createPerson(name: string, age: number) {name: name, age: age}
// Example Usage: createPerson("Alice", 30) // Returns {name: "Alice", age: 30}

// 11. Function With function as parameter
// function(value: number, transform: function<number, number, string> -> number)
