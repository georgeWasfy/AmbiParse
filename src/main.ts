import { alt, lazy, match, parse, seq } from "./parser";

// left recursive grammar Examples

// const ps = alt(
//   seq(
//     lazy(() => ps),
//     match("a")
//   ),
//   match("a")
// );

// ps.run("aaa", console.log);

//  GRAMMAR
// expr -> term "b"
// term -> term "a"| "a"
const term = alt(
  seq(
    lazy(() => term),
    match("a")
  ),
  match("a")
);
const expr = seq(term, match("b"));
const expParser = parse(expr);
const result = expParser("aab");
console.log(result);
