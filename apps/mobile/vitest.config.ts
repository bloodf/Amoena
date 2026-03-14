import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "src"),
      "react-native": "react-native-web",
      "expo-router": path.resolve(dirname, "src/test/expo-router.tsx"),
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: [path.resolve(dirname, "src/test/vitest-setup.ts")],
  },
});
