import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Ban,
  Bell,
  Bookmark,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Clipboard,
  Clock,
  Cloud,
  Code,
  Copy,
  CreditCard,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  File,
  FileText,
  Filter,
  Folder,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Globe,
  GripVertical,
  Hash,
  Heart,
  HelpCircle,
  Home,
  Image,
  Inbox,
  Info,
  Key,
  Layers,
  Link,
  List,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Minus,
  Moon,
  MoreHorizontal,
  MoreVertical,
  Package,
  Palette,
  PanelLeft,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Share,
  Shield,
  Slash,
  Sparkles,
  Star,
  Sun,
  Terminal,
  Trash2,
  Type,
  Unlock,
  Upload,
  User,
  Users,
  X,
  Zap,
  Map as MapIcon,
  type LucideIcon,
} from 'lucide-react';

const meta = {
  title: 'Foundation/Icons',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const iconMap: Record<string, LucideIcon> = {
  Map: MapIcon,
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Ban,
  Bell,
  Bookmark,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Clipboard,
  Clock,
  Cloud,
  Code,
  Copy,
  CreditCard,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  File,
  FileText,
  Filter,
  Folder,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Globe,
  GripVertical,
  Hash,
  Heart,
  HelpCircle,
  Home,
  Image,
  Inbox,
  Info,
  Key,
  Layers,
  Link,
  List,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Minus,
  Moon,
  MoreHorizontal,
  MoreVertical,
  Package,
  Palette,
  PanelLeft,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Share,
  Shield,
  Slash,
  Sparkles,
  Star,
  Sun,
  Terminal,
  Trash2,
  Type,
  Unlock,
  Upload,
  User,
  Users,
  X,
  Zap,
};

function IconGallery() {
  const [query, setQuery] = useState('');

  const entries = Object.entries(iconMap).filter(([name]) =>
    name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter icons…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {entries.length} of {Object.keys(iconMap).length} icons
      </p>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {entries.map(([name, Icon]) => (
          <div
            key={name}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-transparent p-3 hover:border-border hover:bg-muted/50 transition-colors cursor-default"
            title={name}
          >
            <Icon className="h-5 w-5 text-foreground" />
            <span className="text-[10px] font-mono text-muted-foreground text-center leading-tight truncate w-full">
              {name}
            </span>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No icons match &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}

export const Gallery: Story = {
  name: 'Icon Gallery',
  render: () => (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">Icons</h1>
      <p className="text-muted-foreground mb-8">
        Commonly used Lucide icons available across the design system. Use the filter to find a
        specific icon by name. Import from{' '}
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">lucide-react</code>.
      </p>
      <IconGallery />
    </div>
  ),
};

export const Sizes: Story = {
  name: 'Icon Sizes',
  render: () => {
    const sizes = [12, 14, 16, 20, 24, 32, 40, 48];

    return (
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Icon Sizes</h1>
        <p className="text-muted-foreground mb-8">
          Icons at various pixel sizes. The recommended default is 16–20px for UI elements.
        </p>

        <div className="flex items-end gap-8">
          {sizes.map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <Star style={{ width: size, height: size }} className="text-foreground" />
              <span className="text-[10px] font-mono text-muted-foreground">{size}px</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};
