import { alt, match, matchPattern, seq, apply, parse } from "../../src/parser";
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

const altParser = alt();
const seqParser = seq();
const matchParser = match();
const applyParser = apply();

const name_parser = applyParser(
  () =>
    altParser(
      () => KEYWORD,
      () => IDENTIFIER,
      () => STRING_LITERAL,
      () =>
        seqParser(
          () => OPEN_PAR,
          () => name_parser,
          () => CLOSE_PAR
        )
    ),
  applyName
);

const column_alias = altParser(
  () => IDENTIFIER,
  () => STRING_LITERAL
);
const table_name = name_parser;
const column_name = name_parser;

const rename_table_stmt_parser = applyParser(
  () =>
    seqParser(
      () => applyParser(() => matchParser("RENAME"), applyKeyword),
      () => applyParser(() => matchParser("TO"), applyKeyword),
      () => name_parser
    ),
  applyRename
);

const drop_column_parser = applyParser(
  () =>
    seqParser(
      () => applyParser(() => matchParser("DROP"), applyKeyword),
      () => applyParser(() => matchParser("COLUMN"), applyKeyword),
      () => name_parser
    ),
  applyDropColumn
);
const alter_table_stmt_parser = seqParser(
  () => applyParser(() => matchParser("ALTER"), applyKeyword),
  () => applyParser(() => matchParser("TABLE"), applyKeyword),
  () =>
    altParser(() =>
      applyParser(
        () =>
          seqParser(
            () => name_parser,
            () => DOT
          ),
        applySchemaName
      )
    ),
  () => applyParser(() => name_parser, applyTableName),
  () =>
    altParser(
      () => rename_table_stmt_parser,
      () => drop_column_parser
    )
);

// common_table_expression
//     : table_name (OPEN_PAR column_name ( COMMA column_name)* CLOSE_PAR)? AS_ OPEN_PAR select_stmt CLOSE_PAR
//   ;
const common_table_expression = seqParser(
  () => table_name,
  () =>
    altParser(() =>
      seqParser(
        () => OPEN_PAR,
        column_name,
        () =>
          altParser(() =>
            seqParser(
              () => COMMA,
              () => column_name
            )
          ),
        () => CLOSE_PAR
      )
    ),

  () => matchParser("AS"),
  () => OPEN_PAR,
  () => select_stmt,
  () => CLOSE_PAR
);

// common_table_stmt
//     : //additional structures
//     WITH_ RECURSIVE_? common_table_expression (COMMA common_table_expression)*
// ;
const common_table_stmt = seqParser(
  () => matchParser("WITH"),
  () => altParser(() => matchParser("RECURSIVE")),
  () => common_table_expression,
  () =>
    altParser(() =>
      seqParser(
        () => COMMA,
        () => common_table_expression
      )
    )
);

// value_row
//     : OPEN_PAR expr (COMMA expr)* CLOSE_PAR
// ;

// values_clause
// : VALUES_ value_row(COMMA value_row) *
      
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

const select_core = altParser(
  seqParser(
    () => matchParser("SELECT"),
    () =>
      altParser(
        () => matchParser("DISTINCT"),
        () => matchParser("ALL")
      ),
    () => result_column
  )
);

// result_column
//     : STAR
//     | table_name DOT STAR
//     | expr ( AS_? column_alias)?
const result_column = altParser(
  () => STAR,
  () =>
    seqParser(
      () => table_name,
      () => DOT,
      () => STAR
    ),
  () =>
    seqParser(
      () => expr,
      () =>
        altParser(
          () => altParser(() => AS),
          () => column_alias
        )
    )
);

// BIND_PARAMETER: '?' DIGIT* | [:@$] IDENTIFIER;
const BIND_PARAMETER = altParser(
  () =>
    seqParser(
      () => matchParser("?"),
      () => DIGITS
    ),
  () =>
    seqParser(
      () =>
        altParser(
          () => matchParser("@"),
          () => matchParser("$")
        ),
      () => IDENTIFIER
    )
);
// unary_operator
//     : MINUS
//     | PLUS
//     | TILDE
//     | NOT_
const UNARY_OPERATOR = altParser(
  () => MINUS,
  () => PLUS,
  () => TILDE,
  () => NOT
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
const expr = altParser(
  () => LITERAL_VALUE,
  () => BIND_PARAMETER,
  () =>
    seqParser(
      () =>
        altParser(
          () =>
            altParser(
              seqParser(
                () => name_parser,
                () => DOT
              )
            ),
          () =>
            altParser(
              seqParser(
                () => name_parser,
                () => DOT
              )
            )
        ),
      () => name_parser
    ),
  () =>
    seqParser(
      () => UNARY_OPERATOR,
      () => expr
    ),
  () =>
    seqParser(
      () => expr,
      () => PIPE2,
      () => expr
    ),
  () =>
    seqParser(
      () => expr,
      () =>
        altParser(
          () => STAR,
          () => DIV,
          () => MOD
        ),
      () => expr
    ),
  () =>
    seqParser(
      () => expr,
      () =>
        altParser(
          () => PLUS,
          () => MINUS
        ),
      () => expr
    ),
  () =>
    seqParser(
      () => expr,
      () =>
        altParser(
          () => LT2,
          () => GT2,
          () => AMP,
          () => PIPE
        ),
      () => expr
    ),
  () =>
    seqParser(
      () => expr,
      () =>
        altParser(
          () => LT,
          () => LT_EQ,
          () => GT,
          () => GT_EQ
        ),
      () => expr
    ),
  () =>
    seqParser(
      () => expr,
      () => AND,
      () => expr
    ),
  () =>
    seqParser(
      () => expr,
      () => OR,
      () => expr
    )
);

const select_stmt = seqParser(
  () => altParser(common_table_stmt),
  () => select_core
  // () => altParser(() => seqParser(
  //     () => coumpound_operator,
  //     () => select_core
  // ))
);

const parser = parse(alter_table_stmt_parser);
const result = parser("ALTER TABLE schema.users DROP COLUMN password");
console.log("~ result:", JSON.stringify(result[0].value));
