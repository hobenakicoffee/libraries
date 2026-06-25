/// <reference types="vite/client" />

declare module "virtual:supabase-schema" {
  export type ColumnInfo = {
    name: string;
    type: string;
    rawType: string;
    nullable: boolean;
    enumName: string | null;
  };

  export type RelationshipInfo = {
    foreignKeyName: string;
    column: string;
    referencedTable: string;
    referencedColumn: string;
    isOneToOne: boolean;
  };

  export type TableInfo = {
    columns: ColumnInfo[];
    relationships: RelationshipInfo[];
  };

  export type ViewInfo = {
    columns: ColumnInfo[];
  };

  export type Schema = {
    tables: Record<string, TableInfo>;
    views: Record<string, ViewInfo>;
    enums: Record<string, string[]>;
  };

  export const schema: Schema;
}
