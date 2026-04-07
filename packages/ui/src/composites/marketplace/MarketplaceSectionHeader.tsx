import { ScreenSectionHeader, ScreenSectionMeta, ScreenSectionTitle } from '../../components/screen.tsx';

export function MarketplaceSectionHeader({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <ScreenSectionHeader className="mb-4">
      <ScreenSectionTitle>{title}</ScreenSectionTitle>
      <ScreenSectionMeta>
        {count} {count === 1 ? "package" : "packages"}
      </ScreenSectionMeta>
    </ScreenSectionHeader>
  );
}
