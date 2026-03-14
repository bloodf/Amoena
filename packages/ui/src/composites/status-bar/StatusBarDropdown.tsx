import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function StatusBarDropdown({
  open,
  onClose,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={ref} className={cn("absolute z-40 overflow-hidden rounded-lg border border-border bg-surface-1 shadow-2xl", className)}>
      {children}
    </div>
  );
}
