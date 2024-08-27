import { alt, lazy, match, parse, seq } from "./parser";

// left recursive grammar Examples

const ps = alt(
  seq(
    lazy(() => ps),
    match("a")
  ),
  match("a")
);

ps.run("aaa", console.log);

//  GRAMMAR
// expr -> term "b"
// term -> term "aac"| "aac"
const term = alt(
  seq(
    lazy(() => term),
    seq(match("a"), match("a"), match("c"))
  ),
  seq(match("a"), match("a"), match("c"))
);
const expr = seq(term, match("b"));
const expParser = parse(expr);
const result = expParser("aacaacb");
console.log(result);
