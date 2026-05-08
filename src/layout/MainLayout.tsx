import type { ReactNode } from "react";
import Header, { type HeaderUser } from "@/layout/Header";

interface MainLayoutProps {
  children: ReactNode;
  user: HeaderUser | null;
}

function MainLayout({ children, user }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 text-slate-900 font-sans">
      <Header user={user} />
      <main className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
