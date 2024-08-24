import { alt, match, matchPattern, seq, apply, parse } from "../src/parser";

const altParser = alt();
const seqParser = seq();
const matchParser = match();
const matchInParser = matchPattern();
const applyParser = apply();

const DOT = matchParser(".");
const OPEN_PAR = matchParser("(");
const CLOSE_PAR = matchParser(")");
const SINGLE_QUOTE = matchParser("'");
const CHARACTERS = matchInParser("^[A-Za-z]");
const NUMBERS = matchInParser(`^\\d+(\\.\\d+)?`);
const DIGIT = "[0-9]";
const HEX_DIGIT = "[0-9A-F]";
const NUMERIC_LITERAL = matchInParser(
  `^((${DIGIT}+ ('.' ${DIGIT}*)?) | ('.' ${DIGIT}+)) ('E' [-+]? ${DIGIT}+)? | '0x' ${HEX_DIGIT}+`
);

const KEYWORD = altParser(
  () => matchParser("RENAME"),
  () => matchParser("TO"),
  () => matchParser("DROP"),
  () => matchParser("COLUMN"),
  () => matchParser("ALTER"),
  () => matchParser("TABLE")
);
const STRING_LITERAL = seqParser(
  () => SINGLE_QUOTE,
  () => CHARACTERS,
  () => SINGLE_QUOTE
);

const IDENTIFIER = altParser(
  () => matchInParser(`"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"`), //characters encapsulated ""
  () => matchInParser("`(?:[^`]|``)*`"), // characters encapsulated ``
  () => matchInParser("\\[([^\\]]*)\\]"), // characters encapsulated []
  () => matchInParser("[A-Z_\u007F-\uFFFF][A-Z_0-9\u007F-\uFFFF]*")
);
const applyKeyword = (keyword: string) => {
  return { type: "keyword", value: keyword };
};

const applyName = (name: string) => {
  return { type: "name", value: name };
};

const applyDropColumn = (v: {type: string, value: string}[]) => {
  return { type: "drop_column_statement", value: v };
};

const applyRename = (v: {type: string, value: string}[]) => {
  return { type: "rename_column_statement", value: v };
};

const applySchemaName = (v: [{type: string, value: string}, '.']) => {
  return {type: 'schema_name', value: v[0]}
}

const applyTableName = (v: {type: string, value: string}) => {
  return {type: 'table_name', value: v}
}



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
    altParser(
      () =>
        applyParser(
          () =>
            seqParser(
              () => name_parser,
              () => DOT
            ),
          applySchemaName
        ),
    ),
  () => applyParser(()=>name_parser, applyTableName),
  () =>
    altParser(
      () => rename_table_stmt_parser,
      () => drop_column_parser
    )
);


const parser = parse(alter_table_stmt_parser);
const result = parser("ALTER TABLE schema.users DROP COLUMN password");
console.log("~ result:",JSON.stringify(result[0].value));
