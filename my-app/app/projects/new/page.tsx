"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Ticket, MicVocal,
  Loader2, AlertCircle, ScrollText, Network, Sparkles, Projector,
} from "lucide-react";
import { FileUpload } from "@/components/forms/file-upload";
import { TeamMemberFields, TeamMemberRow } from "@/components/forms/team-member-fields";

// ── Shared input style ─────────────────────────────────────────────────────────
const IS: React.CSSProperties = {
  width: "100%",
  background: "#0A0A0A",
  border: "1px solid #2A2A2A",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 13,
  color: "#f1f5f9",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.15s, box-shadow 0.15s",
};
const LS: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#64748b",
  marginBottom: 7,
  letterSpacing: "0.01em",
};



function SectionCard({ icon: Icon, iconColor, iconBg, title, sub, children }: {
  icon: React.ElementType; iconColor: string; iconBg: string;
  title: string; sub?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: "#121212", border: "1px solid #2A2A2A", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", borderBottom: "1px solid #2A2A2A" }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon style={{ width: 14, height: 14, color: iconColor }} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{title}</p>
          {sub && <p style={{ fontSize: 11, color: "#333333", marginTop: 1 }}>{sub}</p>}
        </div>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [permUrl, setPermUrl] = useState("");
  const [members, setMembers] = useState<TeamMemberRow[]>([]);
  const [form, setForm] = useState({ title: "", type: "SHORT_FILM", storySummary: "", startDate: "", endDate: "" });
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Project title is required."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, permissionLetterUrl: permUrl || null, members: members.filter(m => m.name && m.studentId && m.phone) }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create project"); return; }
      router.push(`/projects/${data.id}`);
    } catch { setError("An unexpected error occurred."); }
    finally { setLoading(false); }
  };

  // Type option cards
  const typeOpts = [
    { value: "SHORT_FILM", label: "Short Film", icon: Ticket,   color: "#FF6B6B", bg: "#261F06", border: "#665111" },
    { value: "DOCUMENTARY", label: "Documentary", icon: Projector, color: "#34d399", bg: "#022c22", border: "#065f46" },
    { value: "COVER_SONG", label: "Cover Song", icon: MicVocal, color: "#f472b6", bg: "#500724", border: "#9d174d" },
  ];

  // Empty status opts since computing dynamically


  return (
    <div style={{ maxWidth: 720 }}>

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link
          href="/projects"
          style={{ width: 36, height: 36, borderRadius: 10, background: "#121212", border: "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}
        >
          <ArrowLeft style={{ width: 16, height: 16, color: "#64748b" }} />
        </Link>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#E50914,#FF3B3B)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 14px rgba(229,9,20,0.35)" }}>
          <Sparkles style={{ width: 16, height: 16, color: "#fff" }} />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>New Project</h1>
          <p style={{ fontSize: 12, color: "#333333", marginTop: 2 }}>Create a new club project</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Error */}
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#1f0708", border: "1px solid #7f1d1d", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#f87171" }}>
            <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} /> {error}
          </div>
        )}

        {/* ── Project Details ── */}
        <SectionCard icon={Ticket} iconColor="#FF6B6B" iconBg="#261F06" title="Project Details">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Title */}
            <div>
              <label style={LS}>Project Title <span style={{ color: "#f87171" }}>*</span></label>
              <input
                type="text"
                placeholder="e.g. The Last Frame"
                value={form.title}
                onChange={e => set("title", e.target.value)}
                required
                style={IS}
                onFocus={e => { e.currentTarget.style.borderColor = "#E50914"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(229,9,20,0.1)"; }}
                onBlur={e  => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            {/* Type — card selector */}
            <div>
              <label style={LS}>Project Type</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {typeOpts.map(o => (
                  <button
                    key={o.value} type="button"
                    onClick={() => set("type", o.value)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                      borderRadius: 10, cursor: "pointer", textAlign: "left",
                      background: form.type === o.value ? o.bg : "#0A0A0A",
                      border: `1.5px solid ${form.type === o.value ? o.border : "#2A2A2A"}`,
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${o.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <o.icon style={{ width: 15, height: 15, color: o.color }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: form.type === o.value ? o.color : "#64748b" }}>{o.label}</p>
                    </div>
                    {form.type === o.value && (
                      <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: o.color, boxShadow: `0 0 8px ${o.color}` }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Status removed as it is now computed by dates */}

            {/* Story summary */}
            <div>
              <label style={LS}>Story Summary</label>
              <textarea
                placeholder="Brief description of the project..."
                value={form.storySummary}
                onChange={e => set("storySummary", e.target.value)}
                rows={4}
                style={{ ...IS, resize: "none", lineHeight: 1.6 }}
                onFocus={e => { e.currentTarget.style.borderColor = "#E50914"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(229,9,20,0.1)"; }}
                onBlur={e  => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            {/* Dates */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={LS}>Start Date</label>
                <input
                  type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)}
                  style={{ ...IS, colorScheme: "dark" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#E50914"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(229,9,20,0.1)"; }}
                  onBlur={e  => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label style={LS}>End Date</label>
                <input
                  type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)}
                  style={{ ...IS, colorScheme: "dark" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#E50914"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(229,9,20,0.1)"; }}
                  onBlur={e  => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Permission Letter ── */}
        <SectionCard
          icon={ScrollText} iconColor="#34d399" iconBg="#022c22"
          title="Permission Letter" sub="Upload official permission letter (PDF/DOC)"
        >
          <FileUpload onUploadComplete={setPermUrl} />
        </SectionCard>

        {/* ── Team Members ── */}
        <SectionCard
          icon={Network} iconColor="#60a5fa" iconBg="#0c1a2e"
          title="Team Members" sub="Add students involved in this project"
        >
          <TeamMemberFields members={members} onChange={setMembers} />
        </SectionCard>

        {/* ── Submit row ── */}
        <div style={{ display: "flex", gap: 12 }}>
          <Link
            href="/projects"
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "11px 0", background: "#121212", border: "1px solid #2A2A2A", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#64748b", textDecoration: "none", textAlign: "center" }}
          >
            Cancel
          </Link>
          <button
            type="submit" disabled={loading}
            style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 0", background: "#E50914", border: "1px solid #B20710", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#fff", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: "0 0 18px rgba(229,9,20,0.3)" }}
          >
            {loading ? <><Loader2 style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} /> Creating…</> : <><Sparkles style={{ width: 15, height: 15 }} /> Create Project</>}
          </button>
        </div>
      </form>
    </div>
  );
}
