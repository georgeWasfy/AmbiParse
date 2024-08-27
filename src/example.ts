import { alt, lazy, match, seq } from "./parser";

const ps = alt(
  seq(
    lazy(() => ps),
    match("a")
  ),
  match("a")
);

ps.run("aaa", console.log);
