import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ScreenView,
  ScreenContainer,
  ScreenHeader,
  ScreenHeaderText,
  ScreenTitle,
  ScreenDescription,
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

const meta: Meta = {
  title: "Components/Screen",
  component: ScreenView,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ScreenView>
      <ScreenContainer>
        <ScreenHeader>
          <ScreenHeaderText>
            <ScreenTitle>Dashboard</ScreenTitle>
            <ScreenDescription>Overview of your workspace</ScreenDescription>
          </ScreenHeaderText>
          <ScreenActions>
            <button type="button">Action</button>
          </ScreenActions>
        </ScreenHeader>
        <ScreenStack>
          <ScreenSection>
            <ScreenSectionHeader>
              <ScreenSectionTitle>Recent Activity</ScreenSectionTitle>
              <ScreenSectionMeta>12 items</ScreenSectionMeta>
            </ScreenSectionHeader>
            <p>Section content goes here</p>
          </ScreenSection>
        </ScreenStack>
      </ScreenContainer>
    </ScreenView>
  ),
};

export const WithSidebar: Story = {
  render: () => (
    <ScreenSidebarLayout>
      <ScreenSidebar>
        <ScreenNavSection title="Navigation">
          <ScreenNavButton active>Home</ScreenNavButton>
          <ScreenNavButton>Settings</ScreenNavButton>
          <ScreenNavButton>Profile</ScreenNavButton>
        </ScreenNavSection>
      </ScreenSidebar>
      <ScreenMain>
        <ScreenContainer>
          <ScreenTitle>Main Content</ScreenTitle>
        </ScreenContainer>
      </ScreenMain>
    </ScreenSidebarLayout>
  ),
};

export const WithToolbar: Story = {
  render: () => (
    <ScreenView>
      <ScreenContainer>
        <ScreenToolbar>
          <ScreenToolbarGroup>
            <ScreenToolbarLabel>Filter by:</ScreenToolbarLabel>
            <button type="button">All</button>
            <button type="button">Active</button>
          </ScreenToolbarGroup>
        </ScreenToolbar>
      </ScreenContainer>
    </ScreenView>
  ),
};
