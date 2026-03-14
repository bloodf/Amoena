import type { Preview } from "@storybook/react-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
import React from "react";
import "../src/globals.css";

const VIEWPORTS = {
  mobile: {
    name: "Mobile",
    styles: { width: "375px", height: "812px" }
  },
  tablet: {
    name: "Tablet",
    styles: { width: "768px", height: "1024px" }
  },
  desktop: {
    name: "Desktop",
    styles: { width: "1440px", height: "900px" }
  }
};

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: {
        light: "light",
        dark: "",
      },
      defaultTheme: "dark"
    }),
    (Story) =>
      React.createElement(
        "div",
        {
          className: "bg-background text-foreground",
          style: { padding: "1rem" },
        },
        React.createElement(Story)
      ),
  ],

  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },

    docs: {
      autodocs: true,
    },

    viewport: {
      options: VIEWPORTS
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo"
    }
  },

  initialGlobals: {
    viewport: {
      value: "desktop",
      isRotated: false
    }
  },

  tags: ["autodocs"]
};

export default preview;
