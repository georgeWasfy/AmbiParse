import {
  alt,
  match,
  seq,
  apply,
  parse,
  lazy,
  optional,
} from "../../src/parser";
import {
  applyDropColumn,
  applyKeyword,
  applyName,
  applyRename,
  applySchemaName,
  applyTableName,
} from "./AST";
import {
  SINGLE_QUOTE,
  CHARACTERS,
  NUMERIC_LITERAL,
  OPEN_PAR,
  CLOSE_PAR,
  DOT,
  COMMA,
  DIGITS,
  MINUS,
  PLUS,
  TILDE,
  NOT,
  PIPE2,
  STAR,
  MOD,
  DIV,
  LT2,
  GT2,
  AMP,
  PIPE,
  LT,
  LT_EQ,
  GT,
  GT_EQ,
  AND,
  OR,
  IDENTIFIER,
  KEYWORD,
  LITERAL_VALUE,
  STRING_LITERAL,
  AS,
} from "./Tokens";

const name_parser = apply(
  alt(
    KEYWORD,
    IDENTIFIER,
    STRING_LITERAL,
    seq(
      OPEN_PAR,
      lazy(() => name_parser),
      CLOSE_PAR
    )
  ),
  applyName
);

const column_alias = alt(IDENTIFIER, STRING_LITERAL);
const table_name = name_parser;
const column_name = name_parser;

const rename_table_stmt = apply(
  seq(
    apply(match("RENAME"), applyKeyword),
    apply(match("TO"), applyKeyword),
    name_parser
  ),
  applyRename
);

const drop_column_stmt = apply(
  seq(
    apply(match("DROP"), applyKeyword),
    apply(match("COLUMN"), applyKeyword),
    name_parser
  ),
  applyDropColumn
);
const alter_table_stmt = seq(
  apply(match("ALTER"), applyKeyword),
  apply(match("TABLE"), applyKeyword),
  alt(apply(seq(name_parser, DOT), applySchemaName)),
  apply(name_parser, applyTableName),
  alt(rename_table_stmt, drop_column_stmt)
);

const one_or_more_columns = alt(
  seq(
    lazy(() => one_or_more_columns),
    seq(COMMA, column_name)
  ),
  column_name
);

// common_table_expression
//     : table_name (OPEN_PAR column_name ( COMMA column_name)* CLOSE_PAR)? AS_ OPEN_PAR select_stmt CLOSE_PAR
const common_table_expression = seq(
  table_name,
  optional(seq(OPEN_PAR, one_or_more_columns, CLOSE_PAR)),
  match("AS"),
  OPEN_PAR,
  lazy(() => select_stmt),
  CLOSE_PAR
);
const one_ore_more_common_table_expression = alt(
  seq(
    lazy(() => one_ore_more_common_table_expression),
    seq(COMMA, common_table_expression)
  ),
  common_table_expression
);
// common_table_stmt
//     WITH_ RECURSIVE_? common_table_expression (COMMA common_table_expression)*
// ;
const common_table_stmt = seq(
  match("WITH"),
  optional(match("RECURSIVE")),
  OPEN_PAR,
  lazy(() => select_stmt),
  CLOSE_PAR
);

// value_row
//     : OPEN_PAR expr (COMMA expr)* CLOSE_PAR
// ;

// values_clause
// : VALUES_ value_row(COMMA value_row) *

// unary_operator
//     : MINUS
//     | PLUS
//     | TILDE
//     | NOT_
const UNARY_OPERATOR = alt(MINUS, PLUS, TILDE, NOT);

// BIND_PARAMETER: '?' DIGIT* | [:@$] IDENTIFIER;
const BIND_PARAMETER = alt(
  seq(match("?"), DIGITS),
  seq(alt(match("@"), match("$")), IDENTIFIER)
);
// expr
//     : literal_value
//     | BIND_PARAMETER
//     | ((schema_name DOT)? table_name DOT)? column_name
//     | unary_operator expr
//     | expr PIPE2 expr
//     | expr ( STAR | DIV | MOD) expr
//     | expr ( PLUS | MINUS) expr
//     | expr ( LT2 | GT2 | AMP | PIPE) expr
//     | expr ( LT | LT_EQ | GT | GT_EQ) expr
//     | expr (
//         ASSIGN
//         | EQ
//         | NOT_EQ1
//         | NOT_EQ2
//         | IS_
//         | IS_ NOT_
//         | IS_ NOT_? DISTINCT_ FROM_
//         | IN_
//         | LIKE_
//         | GLOB_
//         | MATCH_
//         | REGEXP_
//     ) expr  NOT SUPPORTED
//     | expr AND_ expr
//     | expr OR_ expr
//     | function_name OPEN_PAR ((DISTINCT_? expr ( COMMA expr)*) | STAR)? CLOSE_PAR filter_clause? over_clause?  NOT SUPORTED
//     | OPEN_PAR expr (COMMA expr)* CLOSE_PAR  NOT SUPPORTED
//     | CAST_ OPEN_PAR expr AS_ type_name CLOSE_PAR  NOT SUPPORTED
//     | expr COLLATE_ collation_name  NOT SUPPORTED
//     | expr NOT_? (LIKE_ | GLOB_ | REGEXP_ | MATCH_) expr (ESCAPE_ expr)? NOT SUPPORTED
//     | expr ( ISNULL_ | NOTNULL_ | NOT_ NULL_) NOT SUPPORTED
//     | expr IS_ NOT_? expr NOT SUPPORTED
//     | expr NOT_? BETWEEN_ expr AND_ expr NOT SUPPORTED
//     | expr NOT_? IN_ (
//         OPEN_PAR (select_stmt | expr ( COMMA expr)*)? CLOSE_PAR
//         | ( schema_name DOT)? table_name
//         | (schema_name DOT)? table_function_name OPEN_PAR (expr (COMMA expr)*)? CLOSE_PAR
//     ) NOT SUPPORTED
//     | ((NOT_)? EXISTS_)? OPEN_PAR select_stmt CLOSE_PAR NOT SUPPORTED
//     | CASE_ expr? (WHEN_ expr THEN_ expr)+ (ELSE_ expr)? END_  NOT SUPPORTED
//     | raise_function  NOT SUPPORTED
//   ;
const expr = alt(
  LITERAL_VALUE,
  BIND_PARAMETER,
  seq(
    alt(
      alt(seq(name_parser, DOT)),

      alt(seq(name_parser, DOT))
    ),
    name_parser
  ),
  seq(
    UNARY_OPERATOR,
    lazy(() => expr)
  ),
  seq(
    lazy(() => expr),
    PIPE2,
    lazy(() => expr)
  ),
  seq(
    lazy(() => expr),
    alt(STAR, DIV, MOD),
    lazy(() => expr)
  ),
  seq(
    lazy(() => expr),
    alt(PLUS, MINUS),
    lazy(() => expr)
  ),
  seq(
    lazy(() => expr),
    alt(LT2, GT2, AMP, PIPE),
    lazy(() => expr)
  ),

  seq(
    lazy(() => expr),
    alt(LT, LT_EQ, GT, GT_EQ),
    lazy(() => expr)
  ),
  seq(
    lazy(() => expr),
    AND,
    lazy(() => expr)
  ),
  seq(
    lazy(() => expr),
    OR,
    lazy(() => expr)
  )
);

// result_column
//     : STAR
//     | table_name DOT STAR
//     | expr ( AS_? column_alias)?
const result_column = STAR;
// seq(table_name, DOT, STAR),
// seq(expr, alt(alt(AS), column_alias))

// select_core
//     : (
//         SELECT_ (DISTINCT_ | ALL_)? result_column (COMMA result_column)* (
//             FROM_ (table_or_subquery (COMMA table_or_subquery)* | join_clause)
//         )? (WHERE_ whereExpr = expr)? (
//             GROUP_ BY_ groupByExpr += expr (COMMA groupByExpr += expr)* (
//                 HAVING_ havingExpr = expr
//             )?
//         )? (WINDOW_ window_name AS_ window_defn ( COMMA window_name AS_ window_defn)*)?
//     )
//     | values_clause
// ;
const select_core = seq(
  match("SELECT"),
  optional(alt(match("DISTINCT"), match("ALL"))),
  result_column
);

const select_stmt = seq(
  optional(common_table_stmt),
  select_core
  //  alt( seq(
  //      coumpound_operator,
  //      select_core
  // ))
);

// const parser = parse(alter_table_stmt);
// alter_table_stmt.run("ALTER TABLE schema.users DROP COLUMN password", console.log);

// const parser = parse(select_stmt);
// const result = parser("WITH RECURSIVE users (password , useername) AS (SELECT *)");
// console.log("~ result:", JSON.stringify(result));

select_stmt.run("WITH (SELECT *)", console.log);

// const parser = parse(select_stmt);
// const result = parser("WITH RECURSIVE (SELECT *)");
// console.log("~ result:", JSON.stringify(result));

// one_ore_more_common_table_expression.run(
//   "users (password , username)",
//   console.log
// );

// const parser = parse(one_ore_more_common_table_expression);
// const result = parser("users (password , useername)");
// console.log("🚀 ~ result:", JSON.stringify(result))
