import { schema } from "virtual:supabase-schema";
import { useMemo, useState } from "react";

type SelectedItem =
  | { type: "table"; name: string }
  | { type: "view"; name: string }
  | { type: "enum"; name: string };

const tableNames = Object.keys(schema.tables);
const viewNames = Object.keys(schema.views);
const enumNames = Object.keys(schema.enums);

const SectionIcon = ({ label }: { label: string }) => {
  if (label === "Tables") return <span className="text-blue-400">&#9654;</span>;
  if (label === "Views")
    return <span className="text-emerald-400">&#9654;</span>;
  if (label === "Enums") return <span className="text-amber-400">&#9654;</span>;
  return null;
};

const EnumBadge = ({ values }: { values: string[] }) => (
  <span
    className="cursor-help rounded border border-amber-700/40 bg-amber-950/40 px-1.5 py-0.5 font-mono text-[10px] text-amber-300"
    title={values.join(", ")}
  >
    enum
  </span>
);

const SerialBadge = () => (
  <span className="rounded border border-purple-700/40 bg-purple-950/40 px-1.5 py-0.5 font-mono text-[10px] text-purple-300">
    serial
  </span>
);

const NullableBadge = () => (
  <span className="rounded border border-slate-600/40 bg-slate-800/40 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
    null
  </span>
);

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-slate-400 text-xs transition-colors hover:border-slate-500 hover:text-slate-200"
    onClick={onClick}
    type="button"
  >
    <span>&larr;</span>
    <span>Back</span>
  </button>
);

const SchemaViewer = ({ onBack }: { onBack: () => void }) => {
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    Tables: false,
    Views: false,
    Enums: false,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const query = search.toLowerCase();

  const filteredTables = useMemo(
    () => tableNames.filter((n) => n.includes(query)),
    [query]
  );
  const filteredViews = useMemo(
    () => viewNames.filter((n) => n.includes(query)),
    [query]
  );
  const filteredEnums = useMemo(
    () => enumNames.filter((n) => n.includes(query)),
    [query]
  );

  const hasTables = filteredTables.length > 0;
  const hasViews = filteredViews.length > 0;
  const hasEnums = filteredEnums.length > 0;

  const toggleSection = (section: string) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSelect = (item: SelectedItem) => {
    setSelected(item);
    setSidebarOpen(false);
  };

  const handleFKClick = (tableName: string) => {
    setSelected({ type: "table", name: tableName });
  };

  const sel = selected;
  const selectedTable =
    sel !== null && sel.type === "table" ? schema.tables[sel.name] : undefined;
  const selectedView =
    sel !== null && sel.type === "view" ? schema.views[sel.name] : undefined;
  const selectedEnum =
    sel !== null && sel.type === "enum"
      ? { name: sel.name, values: schema.enums[sel.name] ?? [] }
      : undefined;

  const getEnumValues = (enumName: string): string[] | undefined =>
    schema.enums[enumName];

  return (
    <div className="flex h-dvh flex-col bg-[#0a0c10] text-slate-200">
      <header className="flex shrink-0 items-center justify-between border-slate-800 border-b px-6 py-3">
        <div className="flex items-center gap-4">
          <BackButton onClick={onBack} />
          <h1 className="font-mono font-semibold text-sm">
            <span className="text-brand">$</span> supabase schema
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {selected && (
            <span className="hidden font-mono text-slate-500 text-xs sm:inline">
              {selected.type} / {selected.name}
            </span>
          )}
          <button
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-slate-400 text-xs transition-colors hover:border-slate-500 hover:text-slate-200 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            type="button"
          >
            <svg
              aria-label="Menu"
              className="h-4 w-4"
              fill="none"
              role="img"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <title>Open sidebar</title>
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
            <span>Tables</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {sidebarOpen && (
          <button
            aria-label="Close sidebar"
            className="fixed inset-0 z-30 cursor-default bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            type="button"
          />
        )}

        <aside
          className={`w-72 shrink-0 overflow-y-auto border-slate-800 border-r bg-slate-950 p-4 ${
            sidebarOpen
              ? "fixed inset-y-0 left-0 z-40 block"
              : "hidden lg:block"
          }`}
        >
          <SidebarContent
            collapsed={collapsed}
            filteredEnums={filteredEnums}
            filteredTables={filteredTables}
            filteredViews={filteredViews}
            handleSelect={handleSelect}
            hasEnums={hasEnums}
            hasTables={hasTables}
            hasViews={hasViews}
            search={search}
            selected={selected}
            setSearch={setSearch}
            toggleSection={toggleSection}
          />
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {!selected && (
            <div className="flex items-center justify-center pt-24">
              <div className="text-center">
                <div className="mb-4 font-mono text-4xl text-slate-600">
                  {"{ : }"}
                </div>
                <p className="font-mono text-slate-500 text-sm">
                  select a table, view, or enum from the sidebar
                </p>
              </div>
            </div>
          )}

          {selectedTable && sel && (
            <TableDetail
              enumValues={getEnumValues}
              onFKClick={handleFKClick}
              relationships={selectedTable.relationships}
              tableName={sel.name}
            >
              <ColumnsTable
                columns={selectedTable.columns}
                enumValues={getEnumValues}
              />
            </TableDetail>
          )}

          {selectedView && sel && (
            <ViewDetail viewName={sel.name}>
              <ColumnsTable
                columns={selectedView.columns}
                enumValues={getEnumValues}
              />
            </ViewDetail>
          )}

          {selectedEnum && (
            <EnumDetail name={selectedEnum.name} values={selectedEnum.values} />
          )}
        </main>
      </div>
    </div>
  );
};

const SidebarSection = ({
  children,
  collapsed,
  count,
  label,
  onToggle,
}: {
  children: React.ReactNode;
  collapsed: boolean;
  count: number;
  label: string;
  onToggle: () => void;
}) => (
  <div className="mb-3">
    <button
      className="flex w-full cursor-pointer items-center gap-2 rounded px-1 py-1.5 font-mono text-slate-400 text-xs transition-colors hover:text-slate-200"
      onClick={onToggle}
      type="button"
    >
      <span className={`transition-transform ${collapsed ? "-rotate-90" : ""}`}>
        <SectionIcon label={label} />
      </span>
      <span>{label}</span>
      <span className="ml-auto rounded bg-slate-800 px-1.5 py-0.5 text-slate-500">
        {count}
      </span>
    </button>
    {!collapsed && <div className="mt-1 ml-2 space-y-0.5">{children}</div>}
  </div>
);

const SidebarItem = ({
  isActive,
  label,
  onClick,
}: {
  isActive: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    className={`w-full cursor-pointer rounded px-3 py-1.5 text-left font-mono text-xs transition-colors ${
      isActive
        ? "bg-brand/10 text-brand"
        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
    }`}
    onClick={onClick}
    type="button"
  >
    {label}
  </button>
);

const SidebarContent = ({
  collapsed,
  filteredEnums,
  filteredTables,
  filteredViews,
  handleSelect,
  hasEnums,
  hasTables,
  hasViews,
  search,
  selected,
  setSearch,
  toggleSection,
}: {
  collapsed: Record<string, boolean>;
  filteredEnums: string[];
  filteredTables: string[];
  filteredViews: string[];
  handleSelect: (item: SelectedItem) => void;
  hasEnums: boolean;
  hasTables: boolean;
  hasViews: boolean;
  search: string;
  selected: SelectedItem | null;
  setSearch: (v: string) => void;
  toggleSection: (section: string) => void;
}) => (
  <>
    <input
      className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-slate-200 text-xs placeholder-slate-500 outline-none focus:border-brand/50"
      onChange={(e) => setSearch(e.target.value)}
      placeholder="filter tables, views, enums..."
      type="text"
      value={search}
    />

    {!(hasTables || hasViews || hasEnums) && (
      <p className="font-mono text-slate-500 text-xs">no results</p>
    )}

    {hasTables && (
      <SidebarSection
        collapsed={collapsed.Tables ?? false}
        count={filteredTables.length}
        label="Tables"
        onToggle={() => toggleSection("Tables")}
      >
        {filteredTables.map((name) => (
          <SidebarItem
            isActive={selected?.type === "table" && selected.name === name}
            key={name}
            label={name}
            onClick={() => handleSelect({ type: "table", name })}
          />
        ))}
      </SidebarSection>
    )}

    {hasViews && (
      <SidebarSection
        collapsed={collapsed.Views ?? false}
        count={filteredViews.length}
        label="Views"
        onToggle={() => toggleSection("Views")}
      >
        {filteredViews.map((name) => (
          <SidebarItem
            isActive={selected?.type === "view" && selected.name === name}
            key={name}
            label={name}
            onClick={() => handleSelect({ type: "view", name })}
          />
        ))}
      </SidebarSection>
    )}

    {hasEnums && (
      <SidebarSection
        collapsed={collapsed.Enums ?? false}
        count={filteredEnums.length}
        label="Enums"
        onToggle={() => toggleSection("Enums")}
      >
        {filteredEnums.map((name) => (
          <SidebarItem
            isActive={selected?.type === "enum" && selected.name === name}
            key={name}
            label={name}
            onClick={() => handleSelect({ type: "enum", name })}
          />
        ))}
      </SidebarSection>
    )}
  </>
);

const ColumnsTable = ({
  columns,
  enumValues,
}: {
  columns: {
    name: string;
    type: string;
    rawType: string;
    nullable: boolean;
    enumName: string | null;
  }[];
  enumValues: (name: string) => string[] | undefined;
}) => {
  if (columns.length === 0) {
    return (
      <p className="py-4 font-mono text-slate-500 text-xs">
        no columns defined
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="w-full border-collapse font-mono text-xs">
        <thead>
          <tr className="border-slate-800 border-b bg-slate-900/80">
            <Th>Column</Th>
            <Th>Type</Th>
            <Th>Attributes</Th>
          </tr>
        </thead>
        <tbody>
          {columns.map((col) => {
            const enumName: string | null = col.enumName;
            const isEnum = enumName !== null;
            const isSerial = col.rawType === "never";
            const hasEnumValues = isEnum
              ? (enumValues(enumName) ?? [])
              : undefined;

            return (
              <tr
                className="border-slate-800/50 border-b transition-colors hover:bg-slate-800/30"
                key={col.name}
              >
                <Td>{col.name}</Td>
                <Td>
                  <span
                    className={
                      isEnum
                        ? "text-amber-300"
                        : isSerial
                          ? "text-purple-300"
                          : "text-cyan-300"
                    }
                    title={col.rawType}
                  >
                    {col.type}
                  </span>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {isSerial && <SerialBadge />}
                    {col.nullable && <NullableBadge />}
                    {isEnum && <EnumBadge values={hasEnumValues ?? []} />}
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-2.5 text-left font-semibold text-slate-400">
    {children}
  </th>
);

const Td = ({ children }: { children: React.ReactNode }) => (
  <td className="px-4 py-2.5 text-slate-300">{children}</td>
);

const TableDetail = ({
  children,
  enumValues,
  onFKClick,
  relationships,
  tableName,
}: {
  children: React.ReactNode;
  enumValues: (name: string) => string[] | undefined;
  onFKClick: (tableName: string) => void;
  relationships: {
    column: string;
    referencedTable: string;
    referencedColumn: string;
    foreignKeyName: string;
    isOneToOne: boolean;
  }[];
  tableName: string;
}) => (
  <div>
    <div className="mb-6">
      <h2 className="font-mono font-semibold text-lg text-slate-100">
        {tableName}
      </h2>
      <p className="font-mono text-slate-500 text-xs">table</p>
    </div>

    <div className="mb-8">
      <h3 className="mb-3 font-mono text-slate-500 text-xs uppercase tracking-wider">
        Columns
      </h3>
      {children}
    </div>

    {relationships.length > 0 && (
      <div>
        <h3 className="mb-3 font-mono text-slate-500 text-xs uppercase tracking-wider">
          Relationships
        </h3>
        <div className="space-y-1.5">
          {relationships.map((rel) => (
            <RelationshipRow
              enumValues={enumValues}
              isOneToOne={rel.isOneToOne}
              key={rel.foreignKeyName}
              onTableClick={onFKClick}
              rel={rel}
            />
          ))}
        </div>
      </div>
    )}
  </div>
);

const RelationshipRow = ({
  enumValues,
  isOneToOne,
  onTableClick,
  rel,
}: {
  enumValues: (name: string) => string[] | undefined;
  isOneToOne: boolean;
  onTableClick: (tableName: string) => void;
  rel: {
    column: string;
    referencedTable: string;
    referencedColumn: string;
    foreignKeyName: string;
    isOneToOne: boolean;
  };
}) => {
  const hasEnumOnRef = enumValues(rel.referencedTable) !== undefined;
  return (
    <div
      className="group rounded-lg border border-slate-800 bg-slate-900/30 p-3 transition-colors hover:border-slate-700"
      key={rel.foreignKeyName}
    >
      <div className="mb-1 flex items-center gap-2 font-mono text-xs">
        <code className="text-cyan-300">{rel.column}</code>
        <span className="text-slate-600">
          {isOneToOne ? "\u2192" : "\u2192\u2192"}
        </span>
        <button
          className="cursor-pointer text-brand transition-colors hover:text-brand/80"
          onClick={() => onTableClick(rel.referencedTable)}
          title={`Jump to ${rel.referencedTable}`}
          type="button"
        >
          {rel.referencedTable}
        </button>
        <code className="text-slate-500">.{rel.referencedColumn}</code>
        {isOneToOne && (
          <span className="rounded border border-purple-700/30 bg-purple-950/30 px-1.5 py-0.5 text-[10px] text-purple-300">
            1:1
          </span>
        )}
        {hasEnumOnRef && (
          <EnumBadge values={enumValues(rel.referencedTable) ?? []} />
        )}
      </div>
      <div className="font-mono text-[10px] text-slate-600">
        {rel.foreignKeyName.replace(/_fkey$/, "")}
      </div>
    </div>
  );
};

const ViewDetail = ({
  children,
  viewName,
}: {
  children: React.ReactNode;
  viewName: string;
}) => (
  <div>
    <div className="mb-6">
      <h2 className="font-mono font-semibold text-lg text-slate-100">
        {viewName}
      </h2>
      <p className="font-mono text-slate-500 text-xs">view</p>
    </div>

    <div className="mb-8">
      <h3 className="mb-3 font-mono text-slate-500 text-xs uppercase tracking-wider">
        Columns
      </h3>
      {children}
    </div>
  </div>
);

const EnumDetail = ({ name, values }: { name: string; values: string[] }) => (
  <div>
    <div className="mb-6">
      <h2 className="font-mono font-semibold text-lg text-slate-100">{name}</h2>
      <p className="font-mono text-slate-500 text-xs">enum</p>
    </div>

    <div className="mb-8">
      <h3 className="mb-3 font-mono text-slate-500 text-xs uppercase tracking-wider">
        Values
      </h3>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-slate-300 text-xs"
            key={v}
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default SchemaViewer;
