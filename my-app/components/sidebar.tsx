"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import {
  Compass, Ticket, Aperture, History, CalendarDays,
  LogOut, Settings, ChevronLeft, Menu, X,
} from "lucide-react";

const NAV = [
  { label: "Dashboard",   href: "/dashboard", icon: Compass,      color: "#E50914" },
  { label: "Projects",    href: "/projects",  icon: Ticket,       color: "#E50914" },
  { label: "Equipment",   href: "/equipment", icon: Aperture,     color: "#34d399" },
  { label: "Borrow Logs", href: "/borrow",    icon: History,      color: "#60a5fa" },
  { label: "Calendar",    href: "/calendar",  icon: CalendarDays, color: "#fbbf24" },
];

export function Sidebar() {
  const pathname  = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false); // mobile

  const W = collapsed ? 64 : 240;
  const initial = (session?.user?.name ?? "A").charAt(0).toUpperCase();

  return (
    <>
      {/* ── Mobile backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile toggle ── */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden w-9 h-9 flex items-center justify-center rounded-xl"
        style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
      >
        {open ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-white" />}
      </button>

      {/* ── Sidebar panel ── */}
      <div
        className={`fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-250
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ width: W, background: "#0a0a0f", borderRight: "1px solid #2A2A2A" }}
      >
        {/* gradient top bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,#E50914,#ec4899)" }} />

        {/* ── Logo ── */}
        <div
          className="flex items-center flex-shrink-0"
          style={{ height: 60, padding: collapsed ? "0 14px" : "0 16px", borderBottom: "1px solid #2A2A2A", gap: 12 }}
        >
          {/* App Logo */}
          <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-black/50 ring-1 ring-white/10 shadow-lg" style={{ boxShadow: "0 0 15px rgba(229,9,20,0.15)" }}>
            <Image
              src="/logo-dark.png"
              alt="KL-SAC Logo"
              fill
              className="object-cover"
            />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white whitespace-nowrap leading-none">Movie Makers</p>
              <p className="text-[11px] mt-0.5 whitespace-nowrap font-medium" style={{ color: "#E50914" }}>KL-SAC Club</p>
            </div>
          )}
        </div>

        {/* ── Nav items ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: "10px 8px" }}>
          {!collapsed && (
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2 px-2" style={{ color: "#1e3a5f" }}>
              Navigation
            </p>
          )}
          <div className="space-y-0.5">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className="flex items-center rounded-xl relative group transition-colors duration-150"
                  style={{
                    gap: 10,
                    padding: `9px ${collapsed ? 14 : 12}px`,
                    background: active ? `${item.color}15` : "transparent",
                    border: active ? `1px solid ${item.color}25` : "1px solid transparent",
                    color: active ? item.color : "#475569",
                  }}
                >
                  {/* Active left indicator */}
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-md"
                      style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}
                    />
                  )}
                  {/* Hover overlay */}
                  <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "#ffffff06" }} />

                  <item.icon className="flex-shrink-0 relative" style={{ width: 16, height: 16 }} />
                  {!collapsed && (
                    <span className="text-sm font-semibold whitespace-nowrap relative">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ── Bottom section ── */}
        <div className="flex-shrink-0" style={{ padding: "8px 8px 12px", borderTop: "1px solid #2A2A2A" }}>
          <Link
            href="/settings"
            title={collapsed ? "Settings" : undefined}
            className="flex items-center rounded-xl group transition-colors hover:bg-white/[0.04] mb-1"
            style={{ gap: 10, padding: `8px ${collapsed ? 14 : 12}px`, color: "#333333" }}
          >
            <Settings className="w-4 h-4 flex-shrink-0 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
            {!collapsed && <span className="text-sm font-medium whitespace-nowrap group-hover:text-white transition-colors">Settings</span>}
          </Link>

          {/* User block */}
          {!collapsed && session?.user && (
            <div
              className="flex items-center rounded-xl mb-1"
              style={{ gap: 10, padding: "8px 10px", background: "#1A1A1A", border: "1px solid #2A2A2A" }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg,#E50914,#FF3B3B)" }}
              >
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{session.user.name ?? "Admin"}</p>
                <p className="text-[10px] truncate" style={{ color: "#333333" }}>{session.user.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={collapsed ? "Sign out" : undefined}
            className="w-full flex items-center rounded-xl transition-colors group hover:bg-red-500/10"
            style={{ gap: 10, padding: `8px ${collapsed ? 14 : 12}px`, color: "#333333" }}
          >
            <LogOut className="w-4 h-4 flex-shrink-0 group-hover:text-red-400 transition-colors" />
            {!collapsed && <span className="text-sm font-medium whitespace-nowrap group-hover:text-red-400 transition-colors">Sign out</span>}
          </button>
        </div>

        {/* ── Collapse button ── */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-[72px] w-6 h-6 rounded-full items-center justify-center transition-all hover:scale-110"
          style={{ background: "#0a0a0f", border: "1px solid #2A2A2A", color: "#333333" }}
        >
          <ChevronLeft className={`w-3 h-3 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* ── Invisible spacer that pushes content — matches sidebar width ── */}
      <div
        className="hidden lg:block flex-shrink-0 transition-all duration-250"
        style={{ width: W, minWidth: W }}
      />
    </>
  );
}
