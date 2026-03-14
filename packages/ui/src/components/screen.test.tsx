import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import {
  ScreenView,
  ScreenRoot,
  ScreenContainer,
  ScreenHeader,
  ScreenHeaderText,
  ScreenHeaderCopy,
  ScreenTitle,
  ScreenDescription,
  ScreenSubtitle,
  ScreenActions,
  ScreenSidebarLayout,
  ScreenSidebar,
  ScreenMain,
  ScreenToolbar,
  ScreenToolbarGroup,
  ScreenToolbarLabel,
  ScreenSection,
  ScreenStack,
  ScreenSectionHeader,
  ScreenSectionTitle,
  ScreenSectionMeta,
  ScreenNavSection,
  ScreenNavButton,
} from "./screen";

describe("ScreenView", () => {
  test("renders children", () => {
    render(<ScreenView>content</ScreenView>);
    expect(screen.getByText("content")).not.toBeNull();
  });

  test("ScreenRoot is alias for ScreenView", () => {
    expect(ScreenRoot).toBe(ScreenView);
  });
});

describe("ScreenContainer", () => {
  test("renders children with max-width layout", () => {
    render(<ScreenContainer>inner</ScreenContainer>);
    const el = screen.getByText("inner");
    expect(el.className).toContain("max-w-[1100px]");
  });
});

describe("ScreenHeader", () => {
  test("renders header with text and actions", () => {
    render(
      <ScreenHeader>
        <ScreenHeaderText>
          <ScreenTitle>Title</ScreenTitle>
          <ScreenDescription>Desc</ScreenDescription>
        </ScreenHeaderText>
        <ScreenActions>
          <button type="button">Act</button>
        </ScreenActions>
      </ScreenHeader>,
    );
    expect(screen.getByText("Title").tagName).toBe("H1");
    expect(screen.getByText("Desc").tagName).toBe("P");
    expect(screen.getByText("Act")).not.toBeNull();
  });

  test("ScreenHeaderCopy is alias for ScreenHeaderText", () => {
    expect(ScreenHeaderCopy).toBe(ScreenHeaderText);
  });

  test("ScreenSubtitle is alias for ScreenDescription", () => {
    expect(ScreenSubtitle).toBe(ScreenDescription);
  });
});

describe("ScreenTitle", () => {
  test("renders as h1 by default", () => {
    render(<ScreenTitle>Heading</ScreenTitle>);
    expect(screen.getByText("Heading").tagName).toBe("H1");
  });

  test("renders as custom heading tag", () => {
    render(<ScreenTitle as="h2">H2 Title</ScreenTitle>);
    expect(screen.getByText("H2 Title").tagName).toBe("H2");
  });
});

describe("ScreenSidebarLayout", () => {
  test("renders sidebar and main", () => {
    render(
      <ScreenSidebarLayout>
        <ScreenSidebar>nav</ScreenSidebar>
        <ScreenMain>main</ScreenMain>
      </ScreenSidebarLayout>,
    );
    expect(screen.getByText("nav")).not.toBeNull();
    expect(screen.getByText("main")).not.toBeNull();
  });
});

describe("ScreenToolbar", () => {
  test("renders toolbar with groups and labels", () => {
    render(
      <ScreenToolbar>
        <ScreenToolbarGroup>
          <ScreenToolbarLabel>Sort:</ScreenToolbarLabel>
        </ScreenToolbarGroup>
      </ScreenToolbar>,
    );
    expect(screen.getByText("Sort:")).not.toBeNull();
  });
});

describe("ScreenSection", () => {
  test("renders as section by default", () => {
    const { container } = render(<ScreenSection>body</ScreenSection>);
    expect(container.querySelector("section")).not.toBeNull();
  });

  test("renders as custom element", () => {
    const { container } = render(<ScreenSection as="div">body</ScreenSection>);
    expect(container.querySelector("div")).not.toBeNull();
  });
});

describe("ScreenStack", () => {
  test("renders children", () => {
    render(<ScreenStack>stacked</ScreenStack>);
    expect(screen.getByText("stacked")).not.toBeNull();
  });
});

describe("ScreenSectionHeader", () => {
  test("renders title and meta", () => {
    render(
      <ScreenSectionHeader>
        <ScreenSectionTitle>Projects</ScreenSectionTitle>
        <ScreenSectionMeta>5 total</ScreenSectionMeta>
      </ScreenSectionHeader>,
    );
    expect(screen.getByText("Projects").tagName).toBe("H2");
    expect(screen.getByText("5 total")).not.toBeNull();
  });
});

describe("ScreenNavSection", () => {
  test("renders with title", () => {
    render(
      <ScreenNavSection title="Menu">
        <ScreenNavButton>Home</ScreenNavButton>
      </ScreenNavSection>,
    );
    expect(screen.getByText("Menu")).not.toBeNull();
    expect(screen.getByText("Home")).not.toBeNull();
  });

  test("renders without title", () => {
    render(
      <ScreenNavSection>
        <ScreenNavButton>Link</ScreenNavButton>
      </ScreenNavSection>,
    );
    expect(screen.getByText("Link")).not.toBeNull();
  });
});

describe("ScreenNavButton", () => {
  test("renders as button", () => {
    render(<ScreenNavButton>Nav</ScreenNavButton>);
    expect(screen.getByRole("button", { name: "Nav" })).not.toBeNull();
  });

  test("applies active styles", () => {
    render(<ScreenNavButton active>Active</ScreenNavButton>);
    expect(screen.getByRole("button", { name: "Active" }).className).toContain("bg-surface-2");
  });

  test("applies inactive styles by default", () => {
    render(<ScreenNavButton>Inactive</ScreenNavButton>);
    const cls = screen.getByRole("button", { name: "Inactive" }).className;
    expect(cls).not.toMatch(/(?<![/\w-])bg-surface-2(?![/\w])/);
    expect(cls).toContain("hover:bg-surface-2/50");
  });
});

describe("ScreenView — semantic structure", () => {
  test("ScreenTitle renders correct heading level hierarchy", () => {
    render(
      <ScreenView>
        <ScreenHeader>
          <ScreenHeaderText>
            <ScreenTitle>Main Title</ScreenTitle>
          </ScreenHeaderText>
        </ScreenHeader>
        <ScreenSectionHeader>
          <ScreenSectionTitle>Sub Title</ScreenSectionTitle>
        </ScreenSectionHeader>
      </ScreenView>,
    );
    expect(screen.getByText("Main Title").tagName).toBe("H1");
    expect(screen.getByText("Sub Title").tagName).toBe("H2");
  });

  test("ScreenSection renders landmark section element", () => {
    const { container } = render(
      <ScreenView>
        <ScreenSection>Content here</ScreenSection>
      </ScreenView>,
    );
    const sections = container.querySelectorAll("section");
    expect(sections.length).toBeGreaterThan(0);
  });

  test("ScreenDescription renders as paragraph", () => {
    render(
      <ScreenView>
        <ScreenHeader>
          <ScreenHeaderText>
            <ScreenTitle>Title</ScreenTitle>
            <ScreenDescription>A description</ScreenDescription>
          </ScreenHeaderText>
        </ScreenHeader>
      </ScreenView>,
    );
    expect(screen.getByText("A description").tagName).toBe("P");
  });

  test("ScreenActions can contain multiple buttons", () => {
    render(
      <ScreenView>
        <ScreenHeader>
          <ScreenActions>
            <button type="button">Save</button>
            <button type="button">Cancel</button>
          </ScreenActions>
        </ScreenHeader>
      </ScreenView>,
    );
    expect(screen.getByRole("button", { name: "Save" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeNull();
  });
});
