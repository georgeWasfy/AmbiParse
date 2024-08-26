export const applyKeyword = (keyword: string) => {
  return { type: "keyword", value: keyword };
};

export const applyName = (name: string) => {
  return { type: "name", value: name };
};

export const applyDropColumn = (v: { type: string; value: string }[]) => {
  return { type: "drop_column_statement", value: v };
};

export const applyRename = (v: { type: string; value: string }[]) => {
  return { type: "rename_column_statement", value: v };
};

export const applySchemaName = (v: [{ type: string; value: string }, "."]) => {
  return { type: "schema_name", value: v[0] };
};

export const applyTableName = (v: { type: string; value: string }) => {
  return { type: "table_name", value: v };
};
