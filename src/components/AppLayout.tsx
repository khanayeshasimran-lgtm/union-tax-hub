import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f4f5f7]">
      <AppSidebar />

      {/* Main content area */}
      <main className="relative flex-1 overflow-y-auto overflow-x-hidden">

        {/* Subtle top accent line */}
        <div className="sticky top-0 z-10 h-px w-full bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent" />

        {/* Page content */}
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}