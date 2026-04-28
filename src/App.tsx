import { useState } from "react";
import { productInfo } from "@/constants/legal";

const EXPORTS = [
  {
    path: "/constants",
    name: "constants",
    desc: "Payment, Platform, Visibility consts",
  },
  {
    path: "/utils",
    name: "utils",
    desc: "Formatters, validators, social helpers",
  },
  {
    path: "/types",
    name: "types",
    desc: "Supabase + custom TypeScript types",
  },
  {
    path: "/moderation",
    name: "moderation",
    desc: "Profanity detection EN/BN",
  },
  {
    path: "/nuqs",
    name: "nuqs",
    desc: "URL state parsers (zod)",
  },
  {
    path: "/scripts",
    name: "scripts",
    desc: "Build utilities",
  },
  { path: "/hooks", name: "hooks", desc: "React hooks" },
  { path: "/docs", name: "docs", desc: "Documentation & guides" },
];

const App = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("bun add @hobenakicoffee/libraries");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-dvh relative flex flex-col overflow-hidden bg-[#0a0c10] text-slate-200">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_0.5px,transparent_0.5px),linear-gradient(to_bottom,#1e293b_0.5px,transparent_0.5px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/[0.03] blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-[400px] w-[400px] translate-y-1/2 rounded-full bg-cyan-500/[0.03] blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <span className="font-bold font-mono text-cyan-400 text-lg">H</span>
          </div>
          <div>
            <h1 className="font-mono font-semibold text-slate-100 text-sm tracking-tight">
              @hobenakicoffee/libraries
            </h1>
            <p className="font-mono text-slate-500 text-xs">v3.4.2</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/50 px-2 py-1 font-mono text-slate-400 text-xs">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          TypeScript
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/30 px-3 py-1 font-mono text-slate-400 text-xs">
            <span>framework-agnostic</span>
            <span className="text-slate-600">{"//"}</span>
            <span>tree-shakeable</span>
            <span className="text-slate-600">{"//"}</span>
            <span>zod-powered</span>
          </div>

          <h2 className="mb-4 font-bold font-mono text-3xl tracking-tight md:text-5xl">
            <span className="text-slate-100">Shared </span>
            <span className="bg-linear-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              constants,
            </span>
            <br />
            <span className="text-slate-100">utilities & </span>
            <span className="bg-linear-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              types
            </span>
          </h2>

          <p className="mx-auto mb-8 max-w-lg font-mono text-slate-400 text-sm leading-relaxed">
            The core package for{" "}
            <span className="text-cyan-400">"{productInfo.name}"</span>{" "}
            projects. Build faster with pre-built constants, utilities, types,
            and moderation tools.
          </p>

          <div className="group relative mx-auto inline-flex cursor-pointer flex-col items-center gap-3 md:flex-row">
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 p-1 pr-3 font-mono text-sm shadow-[0_0_40px_rgba(99,102,241,0.15)] transition-all group-hover:border-cyan-500/50 group-hover:shadow-[0_0_60px_rgba(99,102,241,0.25)]">
              <button
                className="flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-slate-200 transition-colors hover:bg-slate-700"
                onClick={handleCopy}
                type="button"
              >
                <span className="text-cyan-400">$</span>
                <span>
                  {copied ? " Copied!" : " bun add @hobenakicoffee/libraries"}
                </span>
              </button>
              <span className="text-slate-500">{copied ? "✓" : "›"}</span>
            </div>
            <a
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 font-mono text-sm text-white transition-all hover:bg-indigo-600/90"
              href="/docs/"
            >
              <span>Documentation</span>
              <span className="text-indigo-500">→</span>
            </a>
          </div>
        </div>

        <div className="mt-16 w-full max-w-4xl">
          <div className="mb-3 font-mono text-slate-500 text-xs">
            {"// exports"}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {EXPORTS.map((exp, i) => (
              <a
                className="group relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50 p-3 font-mono transition-all hover:border-slate-600"
                href={
                  exp.path === "/docs" ? exp.path : `/docs${exp.path}/overview`
                }
                key={exp.path}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="absolute inset-0 bg-linear-to-r from-cyan-500/0 to-indigo-500/0 opacity-0 transition-opacity group-hover:from-cyan-500/[0.03] group-hover:to-indigo-500/[0.03] group-hover:opacity-100" />
                <div className="relative">
                  <span className="text-cyan-400 text-xs">
                    @hobenakicoffee/libraries
                  </span>
                  <span className="text-slate-500 text-xs">{exp.path}</span>
                </div>
                <div className="relative mt-1 text-slate-500 text-xs">
                  {exp.desc}
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 w-full max-w-2xl overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs">
          <div className="tems-center mb-2 gap-2 text-slate-500">
            <span className="h-3 w-3 rounded-full bg-emerald-500/20" />
            main.ts
          </div>
          <pre className="text-slate-300">
            <code>
              <span className="text-purple-400">import</span> {"{"}{" "}
              <span className="text-cyan-400">PaymentStatuses</span>, {""}
              <span className="text-cyan-400">SupporterPlatforms</span>
              {"}"} <span className="text-purple-400">from</span>{" "}
              <span className="text-amber-300">
                "@hobenakicoffee/libraries"
              </span>
              {"\n"}
              <span className="text-purple-400">import</span> {"{"}{" "}
              <span className="text-cyan-400">formatAmount</span>, {""}
              <span className="text-cyan-400">getUserPageLink</span>
              {"}"} <span className="text-purple-400">from</span>{" "}
              <span className="text-amber-300">
                "@hobenakicoffee/libraries/utils"
              </span>
              {"\n"}
              <span className="text-purple-400">import</span> type {"{"}{" "}
              <span className="text-cyan-400">Database</span>
              {"}"} <span className="text-purple-400">from</span>{" "}
              <span className="text-amber-300">
                "@hobenakicoffee/libraries/types"
              </span>
            </code>
          </pre>
        </div>
      </main>

      <footer className="relative z-10 px-6 py-4 text-center">
        <p className="font-mono text-slate-600 text-xs">
          <span>© {new Date().getFullYear()}</span>
          <span className="text-slate-700">{" // "}</span>
          <span className="text-slate-500">{productInfo.name}</span>
        </p>
      </footer>
    </div>
  );
};

export default App;
