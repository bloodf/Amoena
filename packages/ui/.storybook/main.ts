import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import remarkGfm from "remark-gfm";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  framework: getAbsolutePath("@storybook/react-vite"),

  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(ts|tsx)"
  ],

  addons: [
    {
      name: getAbsolutePath("@storybook/addon-docs"),
      options: {
        autodocs: true,
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-themes"),
    ...(process.env.CHROMATIC_SKIP_TEST_ADDONS
      ? []
      : [
          getAbsolutePath("@storybook/addon-coverage"),
          getAbsolutePath("@storybook/addon-vitest"),
        ]),
    getAbsolutePath("storybook-addon-pseudo-states"),
    getAbsolutePath("@chromatic-com/storybook"),
  ],

  async viteFinal(config) {
    const { mergeConfig } = await import("vite");
    return mergeConfig(config, {
      resolve: {
        alias: {
          "@": new URL("../src", import.meta.url).pathname
        }
      },
      build: {
        chunkSizeWarningLimit: 3000,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes("node_modules/recharts")) return "vendor-recharts";
              // Do NOT split @storybook - it breaks core-events resolution
              if (id.includes("node_modules/react-router")) return "vendor-router";
              if (id.includes("node_modules/@radix-ui")) return "vendor-radix";
              if (id.includes("node_modules/prismjs")) return "vendor-prism";
            }
          }
        }
      }
    });
  }
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
