import uiConfig from "../../packages/ui/tailwind.config";
import type { Config } from "tailwindcss";

export default {
  ...uiConfig,
  content: [
    "./src/**/*.{ts,tsx}",
    "./index.html",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
} satisfies Config;
