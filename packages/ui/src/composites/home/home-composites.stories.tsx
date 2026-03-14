import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { HomeQuickActions } from "./HomeQuickActions";
import { HomeQuickTipsPanel } from "./HomeQuickTipsPanel";
import { HomeRecentSessionsPanel } from "./HomeRecentSessionsPanel";
import { HomeSystemHealthPanel } from "./HomeSystemHealthPanel";
import { HomeWorkspacesPanel } from "./HomeWorkspacesPanel";
import {
	homeRecentSessions,
	homeWorkspaces,
	homeProviders,
	homeQuickTips,
} from "./data";

/* ------------------------------------------------------------------ */
/*  HomeQuickActions                                                   */
/* ------------------------------------------------------------------ */

const quickActionsMeta: Meta<typeof HomeQuickActions> = {
	title: "Composites/Home/HomeQuickActions",
	component: HomeQuickActions,
};
export default quickActionsMeta;
type QuickActionsStory = StoryObj<typeof HomeQuickActions>;

export const QuickActionsDefault: QuickActionsStory = {
	args: {
		onContinueSession: fn(),
		onOpenWorkspace: fn(),
		onStartAutopilot: fn(),
		onProviderSetup: fn(),
		onSetupWizard: fn(),
	},
};

/* ------------------------------------------------------------------ */
/*  HomeQuickTipsPanel                                                 */
/* ------------------------------------------------------------------ */

const quickTipsMeta: Meta<typeof HomeQuickTipsPanel> = {
	title: "Composites/Home/HomeQuickTipsPanel",
	component: HomeQuickTipsPanel,
};

type QuickTipsStory = StoryObj<typeof HomeQuickTipsPanel>;

export const QuickTipsDefault: QuickTipsStory = {
	args: {
		tips: homeQuickTips,
	},
	render: (args) => <HomeQuickTipsPanel {...args} />,
};

export const QuickTipsSingle: QuickTipsStory = {
	args: {
		tips: homeQuickTips.slice(0, 1),
	},
	render: (args) => <HomeQuickTipsPanel {...args} />,
};

export const QuickTipsEmpty: QuickTipsStory = {
	args: {
		tips: [],
	},
	render: (args) => <HomeQuickTipsPanel {...args} />,
};

/* ------------------------------------------------------------------ */
/*  HomeRecentSessionsPanel                                            */
/* ------------------------------------------------------------------ */

const recentSessionsMeta: Meta<typeof HomeRecentSessionsPanel> = {
	title: "Composites/Home/HomeRecentSessionsPanel",
	component: HomeRecentSessionsPanel,
};

type RecentSessionsStory = StoryObj<typeof HomeRecentSessionsPanel>;

export const RecentSessionsDefault: RecentSessionsStory = {
	args: {
		searchQuery: "",
		onSearchChange: fn(),
		sessions: homeRecentSessions,
		onOpenSession: fn(),
	},
	render: (args) => <HomeRecentSessionsPanel {...args} />,
};

export const RecentSessionsWithSearch: RecentSessionsStory = {
	args: {
		searchQuery: "refactor",
		onSearchChange: fn(),
		sessions: homeRecentSessions,
		onOpenSession: fn(),
	},
	render: (args) => <HomeRecentSessionsPanel {...args} />,
};

export const RecentSessionsEmpty: RecentSessionsStory = {
	args: {
		searchQuery: "",
		onSearchChange: fn(),
		sessions: [],
		onOpenSession: fn(),
	},
	render: (args) => <HomeRecentSessionsPanel {...args} />,
};

/* ------------------------------------------------------------------ */
/*  HomeSystemHealthPanel                                              */
/* ------------------------------------------------------------------ */

const systemHealthMeta: Meta<typeof HomeSystemHealthPanel> = {
	title: "Composites/Home/HomeSystemHealthPanel",
	component: HomeSystemHealthPanel,
};

type SystemHealthStory = StoryObj<typeof HomeSystemHealthPanel>;

export const SystemHealthDefault: SystemHealthStory = {
	args: {
		providers: homeProviders,
		onOpenProvider: fn(),
	},
	render: (args) => <HomeSystemHealthPanel {...args} />,
};

export const SystemHealthAllConnected: SystemHealthStory = {
	args: {
		providers: homeProviders.map((p) => ({
			...p,
			status: "connected" as const,
			color: "green",
		})),
		onOpenProvider: fn(),
	},
	render: (args) => <HomeSystemHealthPanel {...args} />,
};

export const SystemHealthAllError: SystemHealthStory = {
	args: {
		providers: homeProviders.map((p) => ({
			...p,
			status: "error" as const,
			color: "red",
		})),
		onOpenProvider: fn(),
	},
	render: (args) => <HomeSystemHealthPanel {...args} />,
};

/* ------------------------------------------------------------------ */
/*  HomeWorkspacesPanel                                                */
/* ------------------------------------------------------------------ */

const workspacesMeta: Meta<typeof HomeWorkspacesPanel> = {
	title: "Composites/Home/HomeWorkspacesPanel",
	component: HomeWorkspacesPanel,
};

type WorkspacesStory = StoryObj<typeof HomeWorkspacesPanel>;

export const WorkspacesDefault: WorkspacesStory = {
	args: {
		workspaces: homeWorkspaces,
		onViewAll: fn(),
		onOpenWorkspace: fn(),
	},
	render: (args) => <HomeWorkspacesPanel {...args} />,
};

export const WorkspacesSingle: WorkspacesStory = {
	args: {
		workspaces: homeWorkspaces.slice(0, 1),
		onViewAll: fn(),
		onOpenWorkspace: fn(),
	},
	render: (args) => <HomeWorkspacesPanel {...args} />,
};

export const WorkspacesEmpty: WorkspacesStory = {
	args: {
		workspaces: [],
		onViewAll: fn(),
		onOpenWorkspace: fn(),
	},
	render: (args) => <HomeWorkspacesPanel {...args} />,
};
