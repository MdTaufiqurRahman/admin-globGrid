import path from "path";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The API's CORS allows this exact origin, so both servers refuse to drift onto another port.
const port = 5173;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Writes src/routeTree.gen.ts from src/routes; it has to run before the React plugin.
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    // React Compiler through Babel 7, the Babel it is built on.
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: { port, strictPort: true },
  preview: { port, strictPort: true },
});
