import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// __dirname replacement for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Force single React copy by aliasing to root node_modules
    alias: {
      react: path.resolve(__dirname, "..", "node_modules", "react"),
      "react-dom": path.resolve(__dirname, "..", "node_modules", "react-dom"),
    },
    dedupe: ["react", "react-dom"],
  },
});
