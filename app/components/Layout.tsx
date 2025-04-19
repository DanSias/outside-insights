// app/components/Layout.tsx
import type { ReactNode } from "react";

import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Header />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
//
