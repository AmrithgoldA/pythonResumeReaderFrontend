import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import obfuscator from "rollup-plugin-obfuscator";

export default defineConfig({
  plugins: [
    react(),
    {
      ...obfuscator({
        compact: true,
        controlFlowFlattening: true,
        deadCodeInjection: true,
      }),
      apply: "build",
    },
  ],
  build: {
    sourcemap: false,
    minify: "terser",
  },
});
