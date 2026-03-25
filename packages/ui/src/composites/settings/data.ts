import { Bell, Brain, GitBranch, KeyRound, Keyboard, Lock, MessageCircle, MessageSquare, Monitor, Palette, Puzzle, Smartphone, Terminal, Type, Wrench, Shield } from "lucide-react";

export const settingsSections = [
  { id: "general", label: "General", icon: Monitor },
  { id: "editor", label: "Editor", icon: Type },
  { id: "terminal", label: "Terminal", icon: Terminal },
  { id: "session-settings", label: "Session", icon: MessageSquare },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "advanced", label: "Advanced", icon: Wrench },
  { id: "providers", label: "Providers", icon: KeyRound },
  { id: "memory", label: "Memory", icon: Brain },
  { id: "permissions", label: "Permissions", icon: Shield },
  { id: "plugins", label: "Plugins / Extensions", icon: Puzzle },
  { id: "remote", label: "Remote Access", icon: Smartphone },
  { id: "themes", label: "Themes / Appearance", icon: Palette },
  { id: "keybindings", label: "Keybindings", icon: Keyboard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "workspace", label: "Workspace / Git", icon: GitBranch },
  { id: "opinions", label: "Opinions", icon: MessageCircle },
] as const;

export const installedPlugins = [
  { name: "Git Integration Pro", version: "2.1.0", author: "amoena-team", enabled: true, trusted: true, updateAvailable: false, permissions: ["file_read", "file_write", "git"] },
  { name: "Rust Patterns", version: "1.4.2", author: "community", enabled: true, trusted: true, updateAvailable: true, permissions: ["memory_read", "memory_write"] },
  { name: "Docker Tools", version: "0.9.1", author: "community", enabled: false, trusted: false, updateAvailable: false, permissions: ["terminal", "file_read"] },
];

export const keybindings = [
  { action: "Open Command Palette", binding: "⌘K", category: "General" },
  { action: "New Session", binding: "⌘N", category: "General" },
  { action: "Toggle Terminal", binding: "⌘`", category: "General" },
  { action: "Send Message", binding: "Enter", category: "Session" },
  { action: "New Line", binding: "Shift+Enter", category: "Session" },
  { action: "File Picker", binding: "@", category: "Composer" },
  { action: "Skills Menu", binding: "$", category: "Composer" },
  { action: "Commands", binding: "/", category: "Composer" },
  { action: "Save File", binding: "⌘S", category: "Editor" },
  { action: "Close Tab", binding: "⌘W", category: "Editor" },
  { action: "Undo", binding: "⌘Z", category: "Editor" },
  { action: "Redo", binding: "⌘Shift+Z", category: "Editor" },
];

export const installedThemes = [
  { name: "Amoena Dark", active: true, author: "Built-in" },
  { name: "Amoena Light", active: false, author: "Built-in" },
  { name: "Midnight Amethyst", active: false, author: "community" },
];
