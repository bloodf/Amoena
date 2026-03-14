import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

export function RouterFrame({
  initialPath,
  children,
}: {
  initialPath: string;
  children: ReactNode;
}) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="*" element={children} />
      </Routes>
    </MemoryRouter>
  );
}
