import { alt, match, parse, seq } from "./parser";

// left recursive grammar
const altParser = alt();
const seqParser = seq();
const matchParser = match();

const ps = altParser(
  () =>
    seqParser(
      () => ps,
      () => matchParser("a")
    ),
  () => matchParser("a")
);

ps("aaa", console.log);


//  GRAMMAR
// expr -> term "b"
// term -> term "aac"| "aac"
const term = altParser(
  () =>
    seqParser(
      () => term,
      () =>
        seqParser(
          () => matchParser("a"),
          () => matchParser("a"),
          () => matchParser("c")
        )
    ),
  () =>
    seqParser(
      () => matchParser("a"),
      () => matchParser("a"),
      () => matchParser("c")
    )
);
const expr = seqParser(
  () => term,
  () => matchParser("b")
);
const expParser = parse(expr);
const result = expParser("aacaacb");
console.log(result);
