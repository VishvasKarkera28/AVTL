import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const appModule = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  plugins: [react()],
  envDir: workspaceRoot,
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      { find: /^react$/, replacement: appModule("./node_modules/react/index.js") },
      {
        find: /^react\/jsx-runtime$/,
        replacement: appModule("./node_modules/react/jsx-runtime.js")
      },
      {
        find: /^react\/jsx-dev-runtime$/,
        replacement: appModule("./node_modules/react/jsx-dev-runtime.js")
      },
      { find: /^react-dom$/, replacement: appModule("./node_modules/react-dom/index.js") },
      {
        find: /^react-dom\/client$/,
        replacement: appModule("./node_modules/react-dom/client.js")
      }
    ]
  },
  server: {
    port: 3000
  },
  preview: {
    port: 4173
  }
});
