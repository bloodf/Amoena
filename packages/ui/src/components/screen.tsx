import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ScreenView({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("h-full overflow-y-auto", className)}>{children}</div>;
}

export const ScreenRoot = ScreenView;

export function ScreenContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto flex max-w-[1100px] flex-col gap-6 px-6 py-8", className)}>{children}</div>;
}

export function ScreenHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex items-start justify-between gap-4", className)}>{children}</div>;
}

export function ScreenHeaderText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("min-w-0", className)}>{children}</div>;
}

export const ScreenHeaderCopy = ScreenHeaderText;

export function ScreenTitle({
  children,
  className,
  as: Component = "h1",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return <Component className={cn("text-lg font-semibold text-foreground", className)}>{children}</Component>;
}

export function ScreenDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn("mt-0.5 text-[12px] text-muted-foreground", className)}>{children}</p>;
}

export const ScreenSubtitle = ScreenDescription;

export function ScreenActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-shrink-0 items-center gap-2", className)}>{children}</div>;
}

export function ScreenSidebarLayout({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex h-full", className)}>{children}</div>;
}

export function ScreenSidebar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("w-[220px] flex-shrink-0 overflow-y-auto border-r border-border p-3", className)}>{children}</div>;
}

export function ScreenMain({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("min-w-0 flex-1", className)}>{children}</div>;
}

export function ScreenToolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-wrap items-center gap-3", className)}>{children}</div>;
}

export function ScreenToolbarGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex items-center gap-2", className)}>{children}</div>;
}

export function ScreenToolbarLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("text-[11px] text-muted-foreground", className)}>{children}</span>;
}

export function ScreenSection({
  children,
  className,
  as: Component = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return <Component className={cn("space-y-4", className)}>{children}</Component>;
}

export function ScreenStack({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-6", className)}>{children}</div>;
}

export function ScreenSectionHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex items-center justify-between gap-3", className)}>{children}</div>;
}

export function ScreenSectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <h2 className={cn("text-[15px] font-semibold text-foreground", className)}>{children}</h2>;
}

export function ScreenSectionMeta({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("text-[12px] text-muted-foreground", className)}>{children}</span>;
}

export function ScreenNavSection({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {title ? <div className="px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{title}</div> : null}
      {children}
    </div>
  );
}

export function ScreenNavButton({
  children,
  className,
  active = false,
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 rounded px-3 py-2 text-[13px] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors",
        active ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:bg-surface-2/50 hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
