import { alt, match, optional, seq } from "./parserTramp";
import { Tramp } from "./tramp";

const seqParser = seq();
const matchParser = match();
const altParser = alt();
const optionalParser = optional();

const tramp = new Tramp();

const result_column = matchParser("*");

const common_table_stmt = seqParser(
  () => matchParser("WITH"),
  () => matchParser("RECURSIVE"),
  () => matchParser("("),
  () => select_stmt,
  () => matchParser(")")
);
const select_core = seqParser(
  () => matchParser("SELECT"),
  () =>
    optionalParser(() =>
      altParser(
        () => matchParser("DISTINCT"),
        () => matchParser("ALL")
      )
    ),

  () => result_column
);

const select_stmt = seqParser(
  () => optionalParser(() => common_table_stmt),
  () => optionalParser(()=>select_core)
);

// const s = seqParser(
//   () => matchParser("a"),
//   () =>optionalParser(() => matchParser("b")) ,
//   () => matchParser("c"),
//   () => matchParser("d")
// );

// const expr_parser = altparser(

//     lazy(() => seq(expr_parser, ADD, term_parser)),
//     applyBinary

//     lazy(() => seq(expr_parser, SUB, term_parser)),
//     applyBinary

//   lazy(() => term_parser)
// );

// const term_parser = altparser(
//   seqParser(term_parser, MUL, factor_parser),
//   seqParser(term_parser, DIV, factor_parser),
//   factor_parser
// );

// const factor_parser = altparser(
//   seqParser(LPAREN, expr_parser, RPAREN),
//   NUMBERS
// );

// s("acd", tramp, console.log)
select_stmt("WITH RECURSIVE (SELECT *)", tramp, console.log);
tramp.run();
