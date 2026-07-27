import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <main className="w-full px-4 py-6 lg:px-6">
        {children}
      </main>
    </div>
  );
}