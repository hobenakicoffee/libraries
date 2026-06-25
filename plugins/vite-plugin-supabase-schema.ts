import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import type { Plugin } from "vite";

const VIRTUAL_ID = "virtual:supabase-schema";

type ColumnInfo = {
  name: string;
  type: string;
  rawType: string;
  nullable: boolean;
  enumName: string | null;
};

type RelationshipInfo = {
  foreignKeyName: string;
  column: string;
  referencedTable: string;
  referencedColumn: string;
  isOneToOne: boolean;
};

type TableInfo = {
  columns: ColumnInfo[];
  relationships: RelationshipInfo[];
};

type ViewInfo = {
  columns: ColumnInfo[];
};

export type Schema = {
  tables: Record<string, TableInfo>;
  views: Record<string, ViewInfo>;
  enums: Record<string, string[]>;
};

function firstStringLiteral(node: ts.TypeNode): string | undefined {
  if (ts.isTupleTypeNode(node) && node.elements.length > 0) {
    const first = node.elements[0];
    if (
      first &&
      ts.isLiteralTypeNode(first) &&
      ts.isStringLiteral(first.literal)
    ) {
      return first.literal.text;
    }
  }
  return undefined;
}

function parseStringLiteralValue(node: ts.TypeNode): string | undefined {
  if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) {
    return node.literal.text;
  }
  return undefined;
}

function parseBooleanLiteralValue(node: ts.TypeNode): boolean | undefined {
  if (ts.isLiteralTypeNode(node)) {
    if (node.literal.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.literal.kind === ts.SyntaxKind.FalseKeyword) return false;
  }
  return undefined;
}

function extractColumns(
  typeNode: ts.TypeNode,
  sourceFile: ts.SourceFile
): ColumnInfo[] {
  if (!ts.isTypeLiteralNode(typeNode)) return [];

  const columns: ColumnInfo[] = [];
  for (const member of typeNode.members) {
    if (
      !(
        ts.isPropertySignature(member) &&
        member.name &&
        ts.isIdentifier(member.name) &&
        member.type
      )
    ) {
      continue;
    }

    const name = member.name.text;
    const rawType = member.type.getText(sourceFile);
    const { type, nullable, enumName } = analyzeType(rawType);

    columns.push({ name, type, rawType, nullable, enumName });
  }
  return columns;
}

const RELATIONSHIP_HANDLERS: Record<
  string,
  (type: ts.TypeNode, rel: Partial<RelationshipInfo>) => void
> = {
  foreignKeyName(type, rel) {
    const val = parseStringLiteralValue(type);
    if (val) rel.foreignKeyName = val;
  },
  columns(type, rel) {
    const val = firstStringLiteral(type);
    if (val) rel.column = val;
  },
  isOneToOne(type, rel) {
    const val = parseBooleanLiteralValue(type);
    if (val !== undefined) rel.isOneToOne = val;
  },
  referencedRelation(type, rel) {
    const val = parseStringLiteralValue(type);
    if (val) rel.referencedTable = val;
  },
  referencedColumns(type, rel) {
    const val = firstStringLiteral(type);
    if (val) rel.referencedColumn = val;
  },
};

function extractRelationshipEntry(
  element: ts.TypeNode
): Partial<RelationshipInfo> {
  if (!ts.isTypeLiteralNode(element)) return {};

  const rel: Partial<RelationshipInfo> = {};
  for (const member of element.members) {
    if (
      !(
        ts.isPropertySignature(member) &&
        member.name &&
        ts.isIdentifier(member.name) &&
        member.type
      )
    ) {
      continue;
    }

    const handler = RELATIONSHIP_HANDLERS[member.name.text];
    if (handler) handler(member.type, rel);
  }
  return rel;
}

function extractRelationships(typeNode: ts.TypeNode): RelationshipInfo[] {
  if (!ts.isTupleTypeNode(typeNode)) return [];

  const relationships: RelationshipInfo[] = [];
  for (const element of typeNode.elements) {
    const rel = extractRelationshipEntry(element);

    if (
      rel.foreignKeyName &&
      rel.column &&
      rel.referencedTable &&
      rel.referencedColumn
    ) {
      relationships.push(rel as RelationshipInfo);
    }
  }
  return relationships;
}

function analyzeType(rawType: string): {
  type: string;
  nullable: boolean;
  enumName: string | null;
} {
  let typeStr = rawType.trim();
  let nullable = false;

  if (typeStr.endsWith(" | null") || typeStr === "null") {
    nullable = true;
    typeStr = typeStr.replace(/\s*\|\s*null$/, "");
  }

  if (typeStr === "null") {
    return { type: "∅", nullable: true, enumName: null };
  }

  const enumMatch = typeStr.match(
    /^Database\["public"\]\["Enums"\]\["(\w+)"\]$/
  );
  if (enumMatch) {
    return {
      type: enumMatch[1] ?? "",
      nullable,
      enumName: enumMatch[1] ?? null,
    };
  }

  const primitiveMap: Record<string, string> = {
    string: "text",
    number: "number",
    boolean: "boolean",
    Json: "json",
    unknown: "unknown",
    never: "serial",
  };

  const mapped = primitiveMap[typeStr];
  if (mapped) {
    return { type: mapped, nullable, enumName: null };
  }

  const arrayMatch = typeStr.match(/^(.+)\[\]$/);
  if (arrayMatch) {
    const inner = analyzeType(arrayMatch[1] ?? "");
    return {
      type: `${inner.type}[]`,
      nullable,
      enumName: inner.enumName,
    };
  }

  if (typeStr.startsWith("{ ")) {
    return { type: "object", nullable, enumName: null };
  }

  if (/^"[^"]*"(\s*\|\s*"[^"]*")*$/.test(typeStr)) {
    const values = typeStr.split(/\s*\|\s*/).map((s) => s.replace(/"/g, ""));
    return { type: values.join(" | "), nullable, enumName: null };
  }

  return { type: typeStr, nullable, enumName: null };
}

function extractEnums(typeNode: ts.TypeNode): Record<string, string[]> {
  if (!ts.isTypeLiteralNode(typeNode)) return {};

  const enums: Record<string, string[]> = {};
  for (const member of typeNode.members) {
    if (
      !(
        ts.isPropertySignature(member) &&
        member.name &&
        ts.isIdentifier(member.name) &&
        member.type
      )
    ) {
      continue;
    }

    const name = member.name.text;
    const values: string[] = [];

    if (ts.isUnionTypeNode(member.type)) {
      for (const element of member.type.types) {
        const val = parseStringLiteralValue(element);
        if (val) values.push(val);
      }
    }

    if (values.length > 0) {
      enums[name] = values;
    }
  }
  return enums;
}

function extractTables(
  typeNode: ts.TypeNode,
  sourceFile: ts.SourceFile
): Record<string, TableInfo> {
  if (!ts.isTypeLiteralNode(typeNode)) return {};

  const tables: Record<string, TableInfo> = {};
  for (const member of typeNode.members) {
    if (
      !(
        ts.isPropertySignature(member) &&
        member.name &&
        ts.isIdentifier(member.name) &&
        member.type
      )
    ) {
      continue;
    }

    const tableName = member.name.text;
    const tableType = member.type;

    if (!ts.isTypeLiteralNode(tableType)) continue;

    const tableInfo: TableInfo = { columns: [], relationships: [] };

    for (const tableMember of tableType.members) {
      if (
        !(
          ts.isPropertySignature(tableMember) &&
          tableMember.name &&
          ts.isIdentifier(tableMember.name) &&
          tableMember.type
        )
      ) {
        continue;
      }

      const sectionName = tableMember.name.text;

      if (sectionName === "Row") {
        tableInfo.columns = extractColumns(tableMember.type, sourceFile);
      } else if (sectionName === "Relationships") {
        tableInfo.relationships = extractRelationships(tableMember.type);
      }
    }

    tables[tableName] = tableInfo;
  }

  return tables;
}

function extractViews(
  typeNode: ts.TypeNode,
  sourceFile: ts.SourceFile
): Record<string, ViewInfo> {
  if (!ts.isTypeLiteralNode(typeNode)) return {};

  const views: Record<string, ViewInfo> = {};
  for (const member of typeNode.members) {
    if (
      !(
        ts.isPropertySignature(member) &&
        member.name &&
        ts.isIdentifier(member.name) &&
        member.type
      )
    ) {
      continue;
    }

    const viewName = member.name.text;
    const viewType = member.type;

    if (!ts.isTypeLiteralNode(viewType)) continue;

    for (const viewMember of viewType.members) {
      if (
        !(
          ts.isPropertySignature(viewMember) &&
          viewMember.name &&
          ts.isIdentifier(viewMember.name) &&
          viewMember.type
        )
      ) {
        continue;
      }

      if (viewMember.name.text === "Row") {
        views[viewName] = {
          columns: extractColumns(viewMember.type, sourceFile),
        };
      }
    }
  }

  return views;
}

function getPropertyOfTypeLiteral(
  type: ts.TypeLiteralNode,
  name: string
): ts.PropertySignature | undefined {
  return type.members.find(
    (m): m is ts.PropertySignature =>
      ts.isPropertySignature(m) &&
      m.name !== undefined &&
      ts.isIdentifier(m.name) &&
      m.name.text === name
  );
}

function parseSupabaseSchema(): Schema {
  const filePath = resolve(import.meta.dirname, "../src/types/supabase.ts");
  const fileContent = readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    "supabase.ts",
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );

  const databaseTypeAlias = sourceFile.statements.find(
    (s): s is ts.TypeAliasDeclaration =>
      ts.isTypeAliasDeclaration(s) && s.name.text === "Database"
  );

  if (!databaseTypeAlias) {
    throw new Error("Could not find Database type");
  }

  const databaseType = databaseTypeAlias.type;
  if (!ts.isTypeLiteralNode(databaseType)) {
    throw new Error("Database type is not a type literal");
  }

  const publicProp = getPropertyOfTypeLiteral(databaseType, "public");
  if (!publicProp?.type) {
    throw new Error("Could not find Database.public");
  }

  const publicType = publicProp.type;
  if (!ts.isTypeLiteralNode(publicType)) {
    throw new Error("Database.public is not a type literal");
  }

  const tablesProp = getPropertyOfTypeLiteral(publicType, "Tables");
  const tables = tablesProp?.type
    ? extractTables(tablesProp.type, sourceFile)
    : {};

  const viewsProp = getPropertyOfTypeLiteral(publicType, "Views");
  const views = viewsProp?.type ? extractViews(viewsProp.type, sourceFile) : {};

  const enumsProp = getPropertyOfTypeLiteral(publicType, "Enums");
  const enums = enumsProp?.type ? extractEnums(enumsProp.type) : {};

  return { tables, views, enums };
}

const VITE_RESOLVED_ID = `\0${VIRTUAL_ID}`;

export function supabaseSchemaPlugin(): Plugin {
  return {
    name: "supabase-schema",
    resolveId(id) {
      if (id === VIRTUAL_ID) return VITE_RESOLVED_ID;
    },
    load(id) {
      if (id !== VITE_RESOLVED_ID) return;

      try {
        return `export const schema = ${JSON.stringify(parseSupabaseSchema())};`;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return `export const schema = { tables: {}, views: {}, enums: {} }; console.error(${JSON.stringify(`Failed to parse supabase schema: ${message}`)});`;
      }
    },
  };
}
