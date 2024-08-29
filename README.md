## Description
A parser combinator library written in typescript with support for left recursive and ambigous grammars.

## Available Parsers
|Parsers|Description
|:-|:-|
|[match](#match)|takes a string and parses an exact match of that string
|[matchPattern](#matchpattern)|takes a string representation of a regular expression and parses the first match for that regex
|[alt](#alt)|takes any number of parsers and parses using either of the provided parsers (first match) 
|[seq](#seq)|takes any number of parsers and parses the sequence of the provided parsers in order 
|[optional](#optional)|takes a parser and tries to parse using this parser, it succeeds if it is able to parse or not
|[apply](#apply)|takes a parser and a function and applies the function to the parser result

## Basic Usage

### match

Creating a simple parser that matches the string "hello".

```ts
import { match } from "parser";

// define your parser
const parser = match("hello");

// run parser on an input string and calls the callback function on the parsing result
parser.run("hello world", console.log);
```
> { rest: ' world', value: 'hello' }

### matchPattern

Creating a simple parser that matches any digit.

```ts
import { matchPattern } from "parser";

// define your parser
const parser = matchPattern(`^\\d+(\\.\\d+)?`);

// run parser on an input string and calls the callback function on the parsing result
parser.run("12.222", console.log);
```
> { rest: '', value: '12.222' }

### alt

Creating a simple parser that matches the string "hello" or "world".

```ts
import { match, alt } from "parser";

// define your parser
const parser = alt(match("hello"),match("world"));

// run parser on an input string and calls the callback function on the parsing result
parser.run("world", console.log);
```
> { rest: '', value: 'world' }

### seq

Creating a simple parser that matches the sequence "hello" + "world".

```ts
import { match, seq } from "parser";

// define your parser
const parser = seq(match("hello"),match("world"));

// run parser on an input string and calls the callback function on the parsing result
parser.run("hello world", console.log);
```
> { rest: '', value: [ 'hello', 'world' ] }

### optional

Creating a simple parser that matches the sequence "hello" + ("parser")? + "world".

```ts
import { match, seq, optional } from "parser";

// define your parser
const parser = seq(match("hello"), optional(match("parser")), match("world"));

// run parser on an input string and calls the callback function on the parsing result
parser.run("hello world", console.log);
```
> { rest: '', value: [ 'hello', 'world' ] }

### apply

Returns a number from the matched digits string.

```ts
import { matchPattern, apply } from "parser";

// a function that takes a string and casts it to number
function applyNumber(value: string): number {
  return +value;
}
// define your parser
const parser = apply(matchPattern(`^\\d+(\\.\\d+)?`), applyNumber);

// run parser on an input string and calls the callback function on the parsing result
parser.run("12.222", console.log);
```
> { rest: '', value: 12.222 }

## Resources
- https://www.cs.nott.ac.uk/~pszgmh/monparsing.pdf
- https://epsil.github.io/gll/



