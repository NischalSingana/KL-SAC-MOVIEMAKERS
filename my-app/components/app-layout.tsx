"use client";

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { ReactNode } from "react";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex"
      style={{ minHeight: "100vh", background: "#0A0A0A" }}
    >
      <Sidebar />
      {/* Main area — flex-1 fills remaining width after sidebar spacer */}
      <div className="flex-1 flex flex-col" style={{ minWidth: 0 }}>
        <Header />
        <main style={{ flex: 1, padding: "24px 28px 48px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
