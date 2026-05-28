import type { ReactNode } from "react";
import Header from "@/layout/Header";

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 text-slate-900 font-sans">
      <Header />
      <main className="max-w-7xl mx-auto space-y-4">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
