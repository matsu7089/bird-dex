import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import solidPlugin from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    tailwindcss(),
    // TanStackRouterVite must come before solidPlugin
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      target: "solid",
    }),
    solidPlugin(),
  ],
  resolve: {
    alias: {
      "~": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:3000", changeOrigin: true },
      "/auth": { target: "http://localhost:3000", changeOrigin: true },
      "/health": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
  build: {
    target: "esnext",
  },
});
