import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

async function getLatestVersion() {
  const res = await fetch(
    "https://api.github.com/repos/hobenakicoffee/libraries/tags"
  );
  const tags = await res.json();
  return tags[0]?.name ?? "v0.0.0";
}

export default defineConfig(async () => {
  const latestVersion = await getLatestVersion();

  return {
    define: {
      __LATEST_VERSION__: JSON.stringify(latestVersion),
    },
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [
      viteTsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      react(),
      tailwindcss(),
    ],
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(import.meta.dirname, "index.html"),
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
  };
});
