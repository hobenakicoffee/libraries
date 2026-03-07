import { existsSync, readFileSync } from "node:fs";

export function checkEnvEncryption(
  envFiles: string[] = [".env", ".env.production"]
) {
  const ALLOWED = new Set([
    "DOTENV_PUBLIC_KEY",
    "DOTENV_PUBLIC_KEY_PRODUCTION",
  ]);
  let hasError = false;

  for (const file of envFiles) {
    if (!existsSync(file)) {
      console.warn(`⚠️ Skipping missing file: ${file}`);
      continue;
    }

    const text = readFileSync(file, "utf-8");
    const lines = text.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...rest] = trimmed.split("=");
      if (!key || rest.length === 0) continue;
      let value = rest.join("=").trim();
      value = value.replace(/^['"]|['"]$/g, "");
      if (ALLOWED.has(key)) continue;
      if (!value.startsWith("encrypted:")) {
        console.error(`❌ ${file} -> ${key} is not encrypted`);
        hasError = true;
      }
    }
  }

  if (hasError) {
    console.error("\n🚨 Env encryption validation failed");
    process.exit(1);
  }
  console.log("✅ All env variables are encrypted");
}

// CLI support — works in both Bun and Node
const isMain =
  process.argv[1] === import.meta.url.replace("file://", "") ||
  // biome-ignore lint/correctness/noUndeclaredVariables: <optional check>
  (typeof Bun !== "undefined" && import.meta.main);

if (isMain) {
  checkEnvEncryption();
}
