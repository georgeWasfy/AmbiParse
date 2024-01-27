import { alt, match, seq } from "./parser";

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
