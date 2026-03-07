import Bun from "bun";

export async function checkEnvEncryption(
  envFiles: string[] = [".env", ".env.production"]
) {
  const ALLOWED = new Set([
    "DOTENV_PUBLIC_KEY",
    "DOTENV_PUBLIC_KEY_PRODUCTION",
  ]);

  let hasError = false;

  for (const file of envFiles) {
    const f = Bun.file(file);

    if (!(await f.exists())) {
      console.warn(`⚠️ Skipping missing file: ${file}`);
      continue;
    }

    const text = await f.text();
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

// CLI support
if (import.meta.main) {
  await checkEnvEncryption();
}
