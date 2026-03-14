interface NewSessionFieldLabelProps {
  children: React.ReactNode;
}

export function NewSessionFieldLabel({ children }: NewSessionFieldLabelProps) {
  return (
    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </label>
  );
}
