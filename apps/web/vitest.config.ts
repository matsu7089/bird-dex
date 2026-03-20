import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [solidPlugin()],
  resolve: {
    alias: {
      "~": resolve(__dirname, "src"),
    },
    conditions: ["development", "browser"],
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
