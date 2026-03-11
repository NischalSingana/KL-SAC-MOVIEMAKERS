"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { BellRing, SlidersHorizontal, Power, BadgeCheck } from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "Club Admin";
  const initials = name.split(" ").slice(0, 2).map((n: string) => n[0] ?? "").join("").toUpperCase();

  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Project "The Last Frame" completed', time: "2 hours ago", icon: BadgeCheck }
  ]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 flex items-center h-[64px] px-4 md:px-7 flex-shrink-0"
      style={{
        background: "rgba(10,10,10,0.8)",
        borderBottom: "1px solid #2A2A2A",
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        className="flex items-center w-full justify-end mx-auto"
        style={{ maxWidth: 1320, paddingRight: "clamp(24px, 6%, 180px)" }}
      >
        {/* Right side icons */}
        <div className="flex items-center gap-3 md:gap-4 relative">
        
        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl transition-all"
            style={{ background: showNotifs ? "#2A2A2A" : "transparent" }}
            onMouseEnter={e => { if (!showNotifs) e.currentTarget.style.background = "#1A1A1A"; }}
            onMouseLeave={e => { if (!showNotifs) e.currentTarget.style.background = "transparent"; }}
          >
            <BellRing style={{ width: 18, height: 18, color: showNotifs ? "#f1f5f9" : "#64748b" }} />
            {notifications.length > 0 && (
              <span
                className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border border-[#0A0A0A]"
                style={{ background: "#E50914", boxShadow: "0 0 8px rgba(229,9,20,1)" }}
              />
            )}
          </button>

          {showNotifs && (
            <div
              className="absolute top-[calc(100%+8px)] right-0 w-[320px] rounded-2xl overflow-hidden origin-top-right animate-in fade-in slide-in-from-top-2"
              style={{ background: "#121212", border: "1px solid #2A2A2A", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
            >
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Notifications</p>
                {notifications.length > 0 && (
                  <button onClick={() => setNotifications([])} style={{ fontSize: 11, fontWeight: 600, color: "#E50914", background: "none", border: "none", cursor: "pointer" }}>Mark all read</button>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", padding: 8 }}>
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div key={n.id} style={{ display: "flex", padding: "12px", gap: 12, borderRadius: 10, background: "#1A1A1A", cursor: "pointer" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#261F06", border: "1px solid #665111", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <n.icon style={{ width: 14, height: 14, color: "#FF6B6B" }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", lineHeight: 1.4 }}>{n.text}</p>
                        <p style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{n.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "32px 12px", textAlign: "center", color: "#64748b", fontSize: 13, fontWeight: 500 }}>
                    No new notifications
                  </div>
                )}
              </div>
              <div style={{ padding: "12px", borderTop: "1px solid #2A2A2A", textAlign: "center" }}>
                <Link href="#" style={{ fontSize: 12, fontWeight: 600, color: "#FF6B6B", textDecoration: "none" }}>View all notifications</Link>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6" style={{ background: "#2A2A2A" }} />

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
            className="flex items-center gap-3 p-1.5 pr-4 rounded-xl transition-all cursor-pointer text-left"
            style={{ background: showProfile ? "#2A2A2A" : "transparent" }}
            onMouseEnter={e => { if (!showProfile) e.currentTarget.style.background = "#1A1A1A"; }}
            onMouseLeave={e => { if (!showProfile) e.currentTarget.style.background = "transparent"; }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-black text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#E50914,#FF3B3B)", boxShadow: "0 0 12px rgba(229,9,20,0.35)" }}
            >
              {initials}
            </div>
            {/* The TRUNCATE fixes the corner cut-off */}
            <div className="hidden md:block min-w-0" style={{ maxWidth: 160 }}>
              <p className="text-[13px] font-bold text-white truncate">{name}</p>
              <p className="text-[10px] mt-0.5 font-bold" style={{ color: "#FF6B6B" }}>Admin</p>
            </div>
          </button>

          {showProfile && (
            <div
              className="absolute top-[calc(100%+8px)] right-0 w-[240px] rounded-2xl overflow-hidden origin-top-right animate-in fade-in slide-in-from-top-2"
              style={{ background: "#121212", border: "1px solid #2A2A2A", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
            >
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #2A2A2A" }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9" }}>{name}</p>
                <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{session?.user?.email || "admin@klsac.in"}</p>
              </div>
              <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 2 }}>
                <Link
                  href="/settings"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                  style={{ textDecoration: "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1A1A1A"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <SlidersHorizontal style={{ width: 14, height: 14, color: "#94a3b8" }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>Account Settings</span>
                </Link>
                <div style={{ height: 1, background: "#2A2A2A", margin: "4px 0" }} />
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left border-none bg-transparent"
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1f0708"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <Power style={{ width: 14, height: 14, color: "#f87171" }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#f87171" }}>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
      </div>
    </header>
  );
}
