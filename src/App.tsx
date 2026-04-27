import { useState } from "react";
import { productInfo } from "@/constants/legal";

const FEATURES = [
  { icon: "★", label: "Utilities", desc: "Format amounts, dates & more" },
  { icon: "◆", label: "Types", desc: "Full Supabase type definitions" },
  {
    icon: "●",
    label: "UI Components",
    desc: "30+ accessible Radix-based components",
  },
  { icon: "◈", label: "Moderation", desc: "Profanity detection for EN & BN" },
];

const App = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("npm install @hobenakicoffee/libraries");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-dvh relative flex flex-col overflow-hidden bg-[#0f0d0a] text-[#e8dfd0]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 h-[200%] w-[200%] animate-pulse-slow bg-[radial-gradient(circle_at_30%_20%,_rgba(180,130,70,0.08)_0%,_transparent_50%)]" />
        <div className="absolute -top-1/4 -right-1/4 h-[150%] w-[150%] animate-pulse-delayed bg-[radial-gradient(circle_at_70%_30%,_rgba(160,110,60,0.06)_0%,_transparent_40%)]" />
        <div className="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-[#3a3028] to-transparent" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-700 shadow-[0_0_30px_rgba(245,158,11,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <span className="text-2xl">☕</span>
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 font-bold text-[0.6rem] text-amber-900">
              α
            </div>
          </div>
          <div>
            <h1 className="font-bold font-noto-bengali text-amber-50 text-xl tracking-tight">
              হবে নাকি Coffee?
            </h1>
            <p className="font-medium text-amber-600/70 text-xs tracking-widest">
              LIBRARIES
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-amber-900/30 bg-amber-950/20 px-3 py-1.5 font-medium text-amber-500 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          v3.4.2
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-900/30 bg-amber-950/10 px-4 py-1.5 font-medium text-amber-500/80 text-xs">
            <span>Framework-agnostic</span>
            <span className="text-amber-700/50">•</span>
            <span>TypeScript</span>
            <span className="text-amber-700/50">•</span>
            <span>Tree-shakeable</span>
          </div>

          <h2 className="mb-6 font-bold font-noto-bengali text-5xl leading-tight tracking-tight md:text-7xl">
            <span className="text-amber-100">Shared </span>
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              constants,
            </span>
            <br />
            <span className="text-amber-100">utilities & </span>
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              components
            </span>
          </h2>

          <p className="mx-auto mb-10 max-w-lg text-amber-100/60 text-lg leading-relaxed">
            The core package for "{productInfo.name}" projects. Build faster
            with pre-built utilities, Supabase types, 30+ UI components, and
            moderation tools.
          </p>

          <div className="group relative mx-auto inline-block max-w-lg cursor-pointer">
            <button
              className="relative w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-600 px-8 py-4 font-mono font-semibold text-amber-950 text-sm shadow-[0_0_40px_rgba(245,158,11,0.3),0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(245,158,11,0.5),0_8px_30px_rgba(0,0,0,0.4)] active:scale-[0.98]"
              onClick={handleCopy}
              type="button"
            >
              <span className="text-lg">$</span>
              <span>
                {copied
                  ? "Copied to clipboard!"
                  : "npm install @hobenakicoffee/libraries"}
              </span>
              <span className="absolute right-4 opacity-0 transition-opacity group-hover:opacity-100">
                ↳
              </span>
            </button>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-amber-700/50 text-xs opacity-0 transition-opacity group-hover:opacity-100">
              click to copy
            </div>
          </div>
        </div>

        <div className="mt-20 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <div
              className="group relative overflow-hidden rounded-2xl border border-amber-900/20 bg-gradient-to-b from-amber-950/30 to-amber-950/10 p-6 text-center transition-all duration-500 hover:border-amber-600/30 hover:bg-amber-950/40"
              key={feature.label}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative mb-3 block text-3xl text-amber-500 transition-all duration-300 group-hover:scale-125 group-hover:text-amber-400">
                {feature.icon}
              </span>
              <h3 className="relative mb-1 font-semibold text-amber-100">
                {feature.label}
              </h3>
              <p className="relative text-amber-100/50 text-xs">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 px-8 py-6 text-center">
        <p className="flex items-center justify-center gap-2 text-amber-700/60 text-xs">
          <span>© {new Date().getFullYear()}</span>
          <span className="text-amber-800/30">|</span>
          <span>{productInfo.name}</span>
          <span className="text-amber-800/30">|</span>
          <span>Built with ☕</span>
        </p>
      </footer>

      <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/[0.03] to-transparent" />
    </div>
  );
};

export default App;
