import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => {
  return {
    base: "/libraries/",
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
