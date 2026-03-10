import { alt, parse } from "../../src/parser";
import { functionDefinition } from "./FunctionDefinition";
import { context } from "./Context";
import { list } from "./BranchesAndIterations";
import { textualExpression } from "./Expression";

const boxedExpression = alt(functionDefinition, context, list);

export const expression = alt(boxedExpression, textualExpression);

const exprParser = parse(expression);

const tests = [
  // Simple literals
  "null",
  "true",
  "false",
  "42",
  "-5",
  "3.14",
  "-2.5",
  "\"hello\"",
  "\"FEEL\"",
  
  // Arithmetic expressions
  "1 + 2",
  "10 - 3",
  "4 * 5",
  "10 / 2",
  "2 ** 3",
  "-5",
  "1 + 2 * 3",
  "(1 + 2) * 3",
  "2 ** 3 + 1",
  
  // Comparison operators
  "1 = 2",
  "1 != 2",
  "1 < 2",
  "1 <= 2",
  "1 > 2",
  "1 >= 2",
  "1 between 2 and 3",
  "5 in (< 10)",
  "5 in [1..10]",
  "5 in (1, 2, 3)",
  
  // Boolean operators
  "true and false",
  "true or false",
  "not true",
  "1 < 2 and 3 < 4",
  "1 < 2 or 3 > 4",
  
  // Path expressions
  "a.b",
  "customer.name",
  "customer.address.city",
  "order.items[1].price",
  
  // Filter expressions
  "[1, 2, 3, 4][0]",
  "[1, 2, 3, 4][-1]",
  "[1, 2, 3, 4][item > 2]",
  "employees[salary > 50000]",
  
  // Instance of
  "x instance of string",
  "x instance of number",
  "x instance of boolean",
  "x instance of date",
  "x instance of list<number>",
  "x instance of context<name:string>",
  
  // If expressions
  "if true then \"yes\" else \"no\"",
  "if 1 < 2 then \"less\" else \"more\"",
  "if score >= 90 then \"A\" else if score >= 80 then \"B\" else \"C\"",
  "if x = null then \"undefined\" else x + 1",
  
  // For expressions
  "for i in [1, 2, 3] return i",
  "for i in [1, 2, 3] return i * i",
  "for i in 1..5 return i",
  "for x in [1, 2], y in [3, 4] return x + y",
  "for i in list return i.name",
  
  // Quantified expressions
  "some x in [1, 2, 3] satisfies x > 2",
  "some x in [1, 2, 3] satisfies x > 10",
  "every x in [1, 2, 3] satisfies x > 0",
  "every x in [1, 2, 3] satisfies x > 2",
  "some i in list satisfies i > max",
  "every x in values satisfies x >= 0",
  
  // Lists
  "[1, 2, 3]",
  "[]",
  "[\"a\", \"b\", \"c\"]",
  "[1, [2, 3], 4]",
  "[for i in 1..3 return i * 2]",
  
  // Contexts
  "{a: 1}",
  "{name: \"John\", age: 30}",
  "{x: 1, y: x + 1}",
  "{person: {name: \"Jane\", age: 25}}",
  "{\"first name\": \"John\", \"last name\": \"Doe\"}",
  
  // Function definitions
  "function(x) x + 1",
  "function(x, y) x + y",
  "function(x: number) x * 2",
  "function(a: number, b: number) a + b",
  "function(list) for i in list return i * 2",
  "function() 42",
  "function(x) if x > 0 then \"positive\" else \"non-positive\"",
  
  // Function invocations
  "add(1, 2)",
  "concat(\"Hello\", \" \", \"World\")",
  "uppercase(\"feEl\")",
  "length(\"test\")",
  "max([1, 5, 3])",
  "count([1, 2, 3])",
  
  // Named parameters
  "add(x: 1, y: 2)",
  "format(message: \"Hello\", name: \"World\")",
  
  // Complex nested expressions
  "(1 + 2) * 3",
  "if count(list) > 0 then max(list) else 0",
  "for i in list return i * 2 + 1",
  "some x in items satisfies x.price > 100 and x.inStock",
  "{total: sum(prices), count: count(prices), average: sum(prices) / count(prices)}",
  "function(items) [for i in items return {name: i.name, taxed: i.price * 1.1}]",
  
  // Null handling
  "null",
  "x = null",
  "if x = null then \"undefined\" else x",
  "coalesce(null, \"default\")",
];

const comprehensiveTests = [
  // ===== LITERALS =====
  // Boolean
  "true",
  "false",
  
  // Numbers - positive, negative, decimal, scientific
  "42",
  "-5",
  "3.14",
  "-2.5",
  "1.2e3",
  "-1.5e-2",
  
  // Strings
  "\"hello\"",
  "\"FEEL\"",
  "\"\"",
  
  // Null
  "null",
  
  // ===== ARITHMETIC =====
  // Addition
  "1 + 2",
  "a + b",
  "1 + 2 + 3",
  
  // Subtraction
  "10 - 3",
  "a - b",
  
  // Multiplication
  "4 * 5",
  "a * b",
  
  // Division
  "10 / 2",
  "a / b",
  
  // Exponentiation
  "2 ** 3",
  "a ** b",
  
  // Unary negation
  "-5",
  "-a",
  
  // Combined precedence
  "1 + 2 * 3",
  "(1 + 2) * 3",
  "2 ** 3 + 1",
  "1 + 2 * 3 - 4 / 2",
  
  // ===== COMPARISON =====
  "1 = 2",
  "1 != 2",
  "1 < 2",
  "1 <= 2",
  "1 > 2",
  "1 >= 2",
  
  // Between
  "1 between 2 and 3",
  "5 between 1 and 10",
  
  // In with unary tests
  "5 in (< 10)",
  "5 in (<= 10)",
  "5 in (> 0)",
  "5 in (>= 0)",
  "5 in [1..10]",
  "5 in (1, 2, 3)",
  "5 in (1, 2, 3, 4, 5)",
  
  // ===== BOOLEAN =====
  "true and false",
  "true or false",
  "not true",
  "not false",
  "1 < 2 and 3 < 4",
  "1 < 2 or 3 > 4",
  "true and false or true",
  "not (true and false)",
  
  // ===== PATH EXPRESSIONS =====
  "a.b",
  "customer.name",
  "customer.address.city",
  "customer.address.zipcode.country",
  "order.items[1].price",
  "company.employees[0].department.name",
  
  // ===== FILTER EXPRESSIONS =====
  "[1, 2, 3, 4][0]",
  "[1, 2, 3, 4][1]",
  "[1, 2, 3, 4][-1]",
  "[1, 2, 3, 4][-2]",
  "[1, 2, 3, 4][item > 2]",
  "employees[salary > 50000]",
  "products[price < 100 and inStock]",
  "orders[status = \"pending\"]",
  
  // ===== INSTANCE OF =====
  "x instance of string",
  "x instance of number",
  "x instance of boolean",
  "x instance of date",
  "x instance of time",
  "x instance of date and time",
  "x instance of days and time duration",
  "x instance of years and months duration",
  "x instance of list",
  "x instance of list<number>",
  "x instance of list<string>",
  "x instance of context",
  "x instance of context<name:string>",
  "x instance of context<name:string, age:number>",
  "x instance of function",
  "x instance of function<number, number>",
  "x instance of function<number, string, boolean>",
  
  // ===== IF EXPRESSIONS =====
  "if true then \"yes\" else \"no\"",
  "if 1 < 2 then \"less\" else \"more\"",
  "if score >= 90 then \"A\" else if score >= 80 then \"B\" else if score >= 70 then \"C\" else \"F\"",
  "if x = null then \"undefined\" else x + 1",
  "if age < 18 then \"minor\" else if age < 65 then \"adult\" else \"senior\"",
  "if isValid then result else null",
  "if a > b then a else b",
  
  // ===== FOR EXPRESSIONS =====
  "for i in [1, 2, 3] return i",
  "for i in [1, 2, 3] return i * i",
  "for i in 1..5 return i",
  "for i in 1..5 return i * 2",
  "for i in 1..10 return i ** 2",
  "for x in [1, 2], y in [3, 4] return x + y",
  "for x in [a, b, c], y in [1, 2] return {k: x, v: y}",
  "for item in list return item.name",
  "for i in range return i * factor",
  
  // ===== QUANTIFIED EXPRESSIONS =====
  "some x in [1, 2, 3] satisfies x > 2",
  "some x in [1, 2, 3] satisfies x > 10",
  "some x in list satisfies x > 0",
  "some employee in employees satisfies employee.salary > 100000",
  "every x in [1, 2, 3] satisfies x > 0",
  "every x in [1, 2, 3] satisfies x > 2",
  "every item in list satisfies item.isValid",
  "every x in values satisfies x >= minimum",
  
  // Combined quantified
  "some x in [1, 2, 3], y in [4, 5] satisfies x + y > 5",
  "every x in [1, 2], y in [1, 2] satisfies x + y > 0",
  
  // ===== LISTS =====
  "[1, 2, 3]",
  "[]",
  "[\"a\", \"b\", \"c\"]",
  "[1, 2, 3, 4, 5]",
  "[\"red\", \"green\", \"blue\"]",
  "[true, false, true]",
  "[1, [2, 3], 4]",
  "[{a: 1}, {a: 2}]",
  "[for i in 1..3 return i * 2]",
  "[for i in list return i.name]",
  
  // ===== CONTEXTS =====
  "{a: 1}",
  "{name: \"John\"}",
  "{name: \"John\", age: 30}",
  "{firstName: \"John\", lastName: \"Doe\", age: 30}",
  "{x: 1, y: x + 1}",
  "{name: person.name, id: person.id}",
  "{person: {name: \"Jane\", age: 25}}",
  "{\"first name\": \"John\", \"last name\": \"Doe\"}",
  "{\"key with spaces\": value}",
  "{items: [1, 2, 3], count: 3}",
  "{nested: {deep: {value: 1}}}",
  
  // ===== FUNCTION DEFINITIONS =====
  "function(x) x + 1",
  "function(x) x * x",
  "function(x, y) x + y",
  "function(a, b, c) a + b + c",
  "function(x: number) x * 2",
  "function(x: number, y: number) x + y",
  "function(a: string) upper case(a)",
  "function(list) count(list)",
  "function(items) for i in items return i.name",
  "function() 42",
  "function() null",
  "function(x) if x > 0 then \"positive\" else if x < 0 then \"negative\" else \"zero\"",
  "function(a, b) if a > b then a else b",
  "function(x: list<number>) sum(x)",
  "function(person: context<name:string>) person.name",
  
  // External function
  "function() external",
  
  // ===== FUNCTION INVOCATIONS (built-in-like) =====
  "add(1, 2)",
  "multiply(3, 4)",
  "concat(\"Hello\", \"World\")",
  "uppercase(\"feEl\")",
  "lower case(\"FEEL\")",
  "length(\"test\")",
  "substring(\"Hello\", 1, 3)",
  "max([1, 5, 3])",
  "min([1, 5, 3])",
  "sum([1, 2, 3, 4, 5])",
  "mean([1, 2, 3])",
  "count([1, 2, 3])",
  "abs(-5)",
  "floor(3.7)",
  "ceiling(3.2)",
  "round(3.5)",
  
  // ===== NAMED PARAMETERS =====
  "add(x: 1, y: 2)",
  "subtract(minuend: 10, subtrahend: 3)",
  "format(template: \"Hello {0}\", arg: \"World\")",
  "substring(string: \"Hello\", start: 1, length: 3)",
  
  // ===== COMPLEX NESTED EXPRESSIONS =====
  "(1 + 2) * 3",
  "((1 + 2) * 3) - 6",
  "if count(list) > 0 then max(list) else 0",
  "for i in list return i * 2 + 1",
  "some x in items satisfies x.price > 100 and x.inStock",
  "every x in values satisfies x >= 0 and x <= 100",
  "{total: sum(prices), count: count(prices), average: sum(prices) / count(prices)}",
  "[for person in employees where person.dept = \"sales\" return {name: person.name, bonus: person.salary * 0.1}]",
  "if isValid then result else {error: \"Invalid input\", code: 400}",
  "function(list) for i in list return {value: i, doubled: i * 2, squared: i ** 2}",
  "some order in orders satisfies (for item in order.items return item.price) / count(order.items) > 100",
  "every customer in customers satisfies some order in customer.orders satisfies order.total > 1000",
  
  // ===== DATE/TIME LITERALS (if supported) =====
  // "@\"2024-01-15\"",
  // "@\"14:30:00\"",
  // "@\"2024-01-15T14:30:00\"",
  // "date(\"2024-01-15\")",
  // "time(\"14:30:00\")",
  
  // ===== RANGE EXPRESSIONS =====
  "1..5",
  "0..10",
  "for i in 1..100 return i",
  
  // ===== PRACTICAL REAL-WORLD EXAMPLES =====
  // Calculate discount
  "if total >= 1000 then 0.1 else if total >= 500 then 0.05 else 0",
  
  // Check eligibility
  "age >= 18 and citizen = true",
  
  // Tax calculation
  "price * (1 + taxRate)",
  
  // Array filtering
  "[for p in people where p.age >= 18 return p.name]",
  
  // Nested context with calculation
  "{subtotal: sum(items.price), tax: sum(items.price) * 0.1, total: sum(items.price) * 1.1}",
  
  // Complex boolean
  "(a and b) or (c and not d)",
  
  // String operations
  "contains(name, \"John\") or contains(name, \"Jane\")",
  
  // Null coalescing
  "if value = null then defaultValue else value",
  
  // Conditional with complex then/else
  "if status = \"active\" then for o in orders where o.customer = id return o else []",
  
  // Function returning context
  "function(x: number) {input: x, squared: x ** 2, cubed: x ** 3}",
  
  // Filter with path
  "employees.departments[name = \"sales\"].employees[salary > 50000]",
];

for (const test of comprehensiveTests) {
  console.log(`\n=== Testing: ${test} ===`);
  const result = exprParser(test);
  console.log(JSON.stringify(result, null, 2));
}
