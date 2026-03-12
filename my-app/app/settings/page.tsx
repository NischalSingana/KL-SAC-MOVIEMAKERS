"use client";

import { useSession, signOut } from "next-auth/react";
import { UserCircle, KeyRound, BellRing, Paintbrush, Fingerprint, ChevronRight, Sparkles, X, Loader2, AlertCircle, CheckCircle2, Sun, Moon, Monitor, Shield, Users, Eye } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();

  const name    = session?.user?.name ?? "Admin User";
  const email   = session?.user?.email ?? "admin@klsac.in";
  const role    = (session?.user as { role?: string })?.role ?? "ADMIN";
  const initial = name.charAt(0).toUpperCase();

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile
  const [newName, setNewName] = useState(name);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notifications preferences (stored locally)
  const [notifPrefs, setNotifPrefs] = useState({
    borrowAlerts:  true,
    projectAlerts: true,
    systemAlerts:  true,
    emailDigest:   false,
  });

  // Appearance
  const [appearance, setAppearance] = useState<"dark" | "light" | "system">("dark");

  const SECTIONS = [
    { id: "profile",       icon: UserCircle,  color: "#E50914", bg: "#1A0305", border: "#3a0a10", title: "Profile",             desc: "Your name, email, and account details" },
    { id: "password",      icon: KeyRound,    color: "#60a5fa", bg: "#0c1a2e", border: "#1e3a5f", title: "Password & Security", desc: "Change your password and manage security" },
    { id: "notifications", icon: BellRing,    color: "#fbbf24", bg: "#1c1100", border: "#78350f", title: "Notifications",       desc: "Control what alerts you receive" },
    { id: "appearance",    icon: Paintbrush,  color: "#a78bfa", bg: "#1e1b4b", border: "#4c1d95", title: "Appearance",          desc: "Customize the look and feel" },
    { id: "permissions",   icon: Fingerprint, color: "#34d399", bg: "#022c22", border: "#065f46", title: "Permissions",         desc: "Manage access and role settings" },
  ];

  const handleOpen = (id: string) => {
    setError(""); setSuccess("");
    if (id === "profile") setNewName(name);
    if (id === "password") { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
    setActiveModal(id);
  };

  const clearModal = () => { setActiveModal(null); setLoading(false); setError(""); setSuccess(""); };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return setError("Name cannot be empty");
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateProfile", name: newName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await updateSession({ name: newName });
      setSuccess("Profile updated successfully!");
      setTimeout(() => clearModal(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError("New passwords do not match");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updatePassword", password: currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Password updated! Signing you out…");
      setTimeout(() => { clearModal(); signOut({ callbackUrl: "/login" }); }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#0A0A0A", border: "1px solid #2A2A2A",
    borderRadius: 10, padding: "10px 14px", color: "#f1f5f9",
    outline: "none", fontSize: 13, boxSizing: "border-box",
  };

  const activeSection = SECTIONS.find(s => s.id === activeModal);

  return (
    <div style={{ maxWidth: 720 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#E50914,#FF3B3B)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 14px rgba(229,9,20,0.35)" }}>
          <Sparkles style={{ width: 16, height: 16, color: "#fff" }} />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>Settings</h1>
          <p style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>Manage your account preferences</p>
        </div>
      </div>

      {/* ── Profile Card ── */}
      <div style={{ background: "#121212", border: "1px solid #2A2A2A", borderRadius: 16, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#E50914,#FF3B3B)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22, fontWeight: 800, color: "#fff", boxShadow: "0 0 20px rgba(229,9,20,0.25)" }}>
          {initial}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9" }}>{name}</p>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{email}</p>
          <div style={{ marginTop: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 999, background: "#1A0305", border: "1px solid #3a0a10", fontSize: 10, fontWeight: 700, color: "#E50914", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {role === "ADMIN" ? "Administrator" : "Member"}
            </span>
          </div>
        </div>
        <button
          onClick={() => handleOpen("profile")}
          style={{ padding: "8px 16px", borderRadius: 10, background: "#2A2A2A", border: "1px solid #333333", fontSize: 12, fontWeight: 700, color: "#f1f5f9", cursor: "pointer" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#333333"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#2A2A2A"; }}
        >
          Edit Profile
        </button>
      </div>

      {/* ── Settings List ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SECTIONS.map((s) => (
          <button
            key={s.title}
            onClick={() => handleOpen(s.id)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "#121212", border: "1px solid #2A2A2A", borderRadius: 14, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#1A1A1A"; el.style.borderColor = "#333"; el.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#121212"; el.style.borderColor = "#2A2A2A"; el.style.transform = "none"; }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon style={{ width: 18, height: 18, color: s.color }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{s.title}</p>
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.desc}</p>
            </div>
            <ChevronRight style={{ width: 16, height: 16, color: "#333333" }} />
          </button>
        ))}
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "#2A2A2A", marginTop: 32, fontWeight: 600 }}>
        KL-SAC Movie Makers · v1.0.0
      </p>

      {/* ── Modals ── */}
      {activeModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }} onClick={clearModal} />
          <div style={{ position: "relative", width: "100%", maxWidth: 460, background: "#121212", border: `1px solid ${activeSection?.border ?? "#2A2A2A"}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>

            {/* Modal Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #2A2A2A", display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {activeSection && (
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: activeSection.bg, border: `1px solid ${activeSection.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <activeSection.icon style={{ width: 15, height: 15, color: activeSection.color }} />
                  </div>
                )}
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9" }}>
                  {activeModal === "profile"       ? "Edit Profile"
                  : activeModal === "password"     ? "Password & Security"
                  : activeModal === "notifications"? "Notification Preferences"
                  : activeModal === "appearance"   ? "Appearance"
                  : "Permissions"}
                </h3>
              </div>
              <button onClick={clearModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", padding: 4 }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* ── Profile Modal ── */}
            {activeModal === "profile" && (
              <form onSubmit={handleUpdateProfile} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                {error   && <div style={{ padding: "10px 12px", background: "#1f0708", border: "1px solid #7f1d1d", borderRadius: 8, color: "#f87171", fontSize: 12, display: "flex", gap: 8, alignItems: "center" }}><AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }}/>{error}</div>}
                {success && <div style={{ padding: "10px 12px", background: "#022c22", border: "1px solid #065f46", borderRadius: 8, color: "#34d399", fontSize: 12, display: "flex", gap: 8, alignItems: "center" }}><CheckCircle2 style={{ width: 14, height: 14, flexShrink: 0 }}/>{success}</div>}
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>Full Name</label>
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>Email Address</label>
                  <input type="text" value={email} disabled style={{ ...inputStyle, background: "#1A1A1A", color: "#475569", cursor: "not-allowed" }} />
                  <p style={{ fontSize: 11, color: "#333333", marginTop: 4 }}>Email cannot be changed from here</p>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>Role</label>
                  <input type="text" value={role === "ADMIN" ? "Administrator" : "Member"} disabled style={{ ...inputStyle, background: "#1A1A1A", color: "#475569", cursor: "not-allowed" }} />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button type="button" onClick={clearModal} style={{ flex: 1, padding: "10px 0", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 10, color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                  <button type="submit" disabled={loading} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", background: "#E50914", border: "1px solid #B20710", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
                    {loading ? <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {/* ── Password Modal ── */}
            {activeModal === "password" && (
              <form onSubmit={handleUpdatePassword} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                {error   && <div style={{ padding: "10px 12px", background: "#1f0708", border: "1px solid #7f1d1d", borderRadius: 8, color: "#f87171", fontSize: 12, display: "flex", gap: 8, alignItems: "center" }}><AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }}/>{error}</div>}
                {success && <div style={{ padding: "10px 12px", background: "#022c22", border: "1px solid #065f46", borderRadius: 8, color: "#34d399", fontSize: 12, display: "flex", gap: 8, alignItems: "center" }}><CheckCircle2 style={{ width: 14, height: 14, flexShrink: 0 }}/>{success}</div>}
                <div style={{ padding: "10px 14px", background: "#0c1a2e", border: "1px solid #1e3a5f", borderRadius: 10, color: "#60a5fa", fontSize: 11, lineHeight: 1.5 }}>
                  You will be signed out after changing your password for security.
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>Current Password</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required style={inputStyle} placeholder="Enter current password" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} style={inputStyle} placeholder="Min. 6 characters" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={inputStyle} placeholder="Repeat new password" />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button type="button" onClick={clearModal} style={{ flex: 1, padding: "10px 0", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 10, color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                  <button type="submit" disabled={loading} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", background: "#0c1a2e", border: "1px solid #1e3a5f", borderRadius: 10, color: "#60a5fa", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
                    {loading ? <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> : "Update Password"}
                  </button>
                </div>
              </form>
            )}

            {/* ── Notifications Modal ── */}
            {activeModal === "notifications" && (
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Choose which notifications you want to receive in real-time inside the app.</p>
                {[
                  { key: "borrowAlerts",  label: "Borrow Alerts",   desc: "When equipment is borrowed or returned" },
                  { key: "projectAlerts", label: "Project Updates",  desc: "New projects, deadlines, and status changes" },
                  { key: "systemAlerts",  label: "System Alerts",   desc: "Security events and important system notices" },
                  { key: "emailDigest",   label: "Email Digest",    desc: "Daily summary email (coming soon)" },
                ].map(item => {
                  const key = item.key as keyof typeof notifPrefs;
                  return (
                    <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#1A1A1A", borderRadius: 10, border: "1px solid #2A2A2A" }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{item.label}</p>
                        <p style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                        style={{
                          width: 44, height: 24, borderRadius: 999, border: "none", cursor: "pointer", flexShrink: 0,
                          background: notifPrefs[key] ? "#E50914" : "#2A2A2A",
                          position: "relative", transition: "background 0.2s",
                          boxShadow: notifPrefs[key] ? "0 0 8px rgba(229,9,20,0.4)" : "none",
                        }}
                      >
                        <span style={{
                          position: "absolute", top: 3, left: notifPrefs[key] ? 22 : 3,
                          width: 18, height: 18, borderRadius: "50%", background: "#fff",
                          transition: "left 0.2s",
                        }} />
                      </button>
                    </div>
                  );
                })}
                <button onClick={clearModal} style={{ marginTop: 4, padding: "10px 0", background: "#E50914", border: "1px solid #B20710", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  Save Preferences
                </button>
              </div>
            )}

            {/* ── Appearance Modal ── */}
            {activeModal === "appearance" && (
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                <p style={{ fontSize: 12, color: "#64748b" }}>Choose how the app looks to you.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {([
                    { value: "dark",   label: "Dark",   Icon: Moon    },
                    { value: "light",  label: "Light",  Icon: Sun     },
                    { value: "system", label: "System", Icon: Monitor },
                  ] as const).map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      onClick={() => setAppearance(value)}
                      style={{
                        padding: "16px 10px", borderRadius: 12, border: `2px solid ${appearance === value ? "#E50914" : "#2A2A2A"}`,
                        background: appearance === value ? "#1A0305" : "#1A1A1A",
                        cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        transition: "all 0.15s", boxShadow: appearance === value ? "0 0 12px rgba(229,9,20,0.2)" : "none",
                      }}
                    >
                      <Icon style={{ width: 22, height: 22, color: appearance === value ? "#E50914" : "#475569" }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: appearance === value ? "#f1f5f9" : "#64748b" }}>{label}</span>
                    </button>
                  ))}
                </div>
                <div style={{ padding: "12px 14px", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Active theme</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[["#0A0A0A", "Background"], ["#121212", "Card"], ["#E50914", "Accent Red"], ["#FF3B3B", "Highlight"]].map(([color, label]) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 16, height: 16, borderRadius: 4, background: color, border: "1px solid #2A2A2A", flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: "#475569" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={clearModal} style={{ padding: "10px 0", background: "#E50914", border: "1px solid #B20710", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  Apply
                </button>
              </div>
            )}

            {/* ── Permissions Modal ── */}
            {activeModal === "permissions" && (
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ padding: "12px 14px", background: "#022c22", border: "1px solid #065f46", borderRadius: 10, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Shield style={{ width: 16, height: 16, color: "#34d399", flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#34d399" }}>Your current role: {role === "ADMIN" ? "Administrator" : "Member"}</p>
                    <p style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Roles are assigned by the system administrator.</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Your Permissions</p>
                  {[
                    { icon: Users,   label: "Manage Members",     allowed: role === "ADMIN" },
                    { icon: Eye,     label: "View All Projects",   allowed: true },
                    { icon: Shield,  label: "Delete Projects",     allowed: role === "ADMIN" },
                    { icon: KeyRound,label: "Manage Equipment",    allowed: role === "ADMIN" },
                    { icon: BellRing,label: "Configure Alerts",    allowed: role === "ADMIN" },
                    { icon: Fingerprint, label: "Manage Roles",   allowed: role === "ADMIN" },
                  ].map(p => (
                    <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#1A1A1A", borderRadius: 10, border: `1px solid ${p.allowed ? "#065f46" : "#2A2A2A"}` }}>
                      <p.icon style={{ width: 15, height: 15, color: p.allowed ? "#34d399" : "#333333", flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13, color: p.allowed ? "#f1f5f9" : "#475569" }}>{p.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: p.allowed ? "#022c22" : "#1A1A1A", color: p.allowed ? "#34d399" : "#333333", border: `1px solid ${p.allowed ? "#065f46" : "#2A2A2A"}` }}>
                        {p.allowed ? "Allowed" : "Restricted"}
                      </span>
                    </div>
                  ))}
                </div>
                <button onClick={clearModal} style={{ marginTop: 4, padding: "10px 0", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 10, color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Close
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
