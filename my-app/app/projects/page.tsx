"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ScanSearch, ExternalLink, Network, Hourglass, BadgeCheck, Zap, Loader2, Download, Clapperboard, Video, Music } from "lucide-react";

interface Project {
  id: string;
  title: string;
  type: "SHORT_FILM" | "COVER_SONG";
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
  startDate: string | null;
  endDate: string | null;
  permissionLetterUrl: string | null;
  members: { id: string }[];
  createdAt: string;
}

const STATUS: Record<string, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
  UPCOMING:  { label: "Upcoming",  color: "#60a5fa", bg: "#0c1a2e", border: "#1e3a5f", Icon: Hourglass      },
  ONGOING:   { label: "Ongoing",   color: "#fbbf24", bg: "#1c1100", border: "#78350f", Icon: Zap          },
  COMPLETED: { label: "Completed", color: "#34d399", bg: "#022c22", border: "#065f46", Icon: BadgeCheck   },
};

const TYPE: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  SHORT_FILM: { label: "Short Film", color: "#FF3B3B", bg: "#1a0b0b", Icon: Clapperboard },
  DOCUMENTARY: { label: "Documentary", color: "#3b82f6", bg: "#0c1a2e", Icon: Video },
  COVER_SONG: { label: "Cover Song", color: "#a855f7", bg: "#1a0e2e", Icon: Music },
};

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const FILTERS = ["ALL", "UPCOMING", "ONGOING", "COMPLETED"];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("ALL");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteTitle, setConfirmDeleteTitle] = useState("");

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(d => setProjects(Array.isArray(d) ? d : [])).catch(() => setProjects([])).finally(() => setLoading(false));
  }, []);

  const promptDelete = (id: string, title: string) => {
    setConfirmDeleteId(id);
    setConfirmDeleteTitle(title);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setDeleting(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(null);
    }
  };

  const filtered = projects.filter(p => {
    const ms = p.title.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "ALL" || p.status === filter;
    return ms && mf;
  });

  const exportCSV = () => {
    const rows = filtered.map(p => [`"${p.title}"`, p.type === "SHORT_FILM" ? "Short Film" : "Cover Song", p.status, fmt(p.startDate), fmt(p.endDate), p.members.length].join(","));
    const csv  = [["Title","Type","Status","Start","End","Members"].join(","), ...rows].join("\n");
    const a    = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: "projects.csv" });
    a.click();
  };

  const C = { card: "#121212", border: "#2A2A2A" };

  return (
    <div style={{ maxWidth: 1320 }}>

      {/* ── Page title + actions ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 3, height: 20, borderRadius: 4, background: "linear-gradient(#E50914,#FF3B3B)", flexShrink: 0 }} />
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>Projects</h1>
          </div>
          <p style={{ fontSize: 12, color: "#333333", paddingLeft: 11 }}>{projects.length} project{projects.length !== 1 ? "s" : ""} total</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#94a3b8", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 10, padding: "8px 14px", cursor: "pointer", opacity: filtered.length === 0 ? 0.4 : 1 }}
          >
            <Download style={{ width: 14, height: 14 }} /> Export CSV
          </button>
          <Link
            href="/projects/new"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#fff", background: "#E50914", border: "1px solid #B20710", borderRadius: 10, padding: "8px 16px", textDecoration: "none", boxShadow: "0 0 14px rgba(229,9,20,0.3)" }}
          >
            <Plus style={{ width: 14, height: 14 }} /> New Project
          </Link>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 320 }}>
          <ScanSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#333333", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", background: "#121212", border: "1px solid #2A2A2A", borderRadius: 10, padding: "8px 12px 8px 36px", fontSize: 13, color: "#e2e8f0", outline: "none" }}
            onFocus={e => { e.currentTarget.style.borderColor = "#E50914"; }}
            onBlur={e  => { e.currentTarget.style.borderColor = "#2A2A2A"; }}
          />
        </div>
        {/* Status pills */}
        <div style={{ display: "flex", gap: 6 }}>
          {FILTERS.map(f => {
            const active = filter === f;
            const meta = f !== "ALL" ? STATUS[f] : null;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 999, cursor: "pointer", transition: "all 0.15s",
                  background: active ? (meta ? meta.bg : "#261F06") : "#121212",
                  color:      active ? (meta ? meta.color : "#FF6B6B") : "#475569",
                  border:     `1px solid ${active ? (meta ? meta.border : "#665111") : "#2A2A2A"}`,
                }}
              >
                {f === "ALL" ? "All" : STATUS[f].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 style={{ width: 24, height: 24, color: "#E50914", animation: "spin 1s linear infinite" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", gap: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "#1A1A1A", border: "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clapperboard style={{ width: 24, height: 24, color: "#2A2A2A" }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>No projects found</p>
            <p style={{ fontSize: 12, color: "#333333" }}>{search ? "Try a different search" : "Create your first project"}</p>
            {!search && (
              <Link href="/projects/new" style={{ fontSize: 13, color: "#E50914", fontWeight: 600, marginTop: 4, textDecoration: "none" }}>+ New Project</Link>
            )}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2A2A2A" }}>
                  {["Project", "Type", "Status", "Duration", "Team", "Actions"].map((h, i) => (
                    <th key={h} style={{ padding: "11px 18px", textAlign: i === 5 ? "right" : "left", fontSize: 11, fontWeight: 700, color: "#333333", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const s    = STATUS[p.status];
                  const t    = TYPE[p.type];
                  const SI   = s.Icon;
                  const TI   = t.Icon;
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid #0f172a" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#1A1A1A"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      {/* Project */}
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <TI style={{ width: 15, height: 15, color: t.color }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{p.title}</span>
                        </div>
                      </td>
                      {/* Type */}
                      <td style={{ padding: "13px 18px" }}>
                        <span style={{ fontSize: 12, color: "#475569" }}>{t.label}</span>
                      </td>
                      {/* Status */}
                      <td style={{ padding: "13px 18px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          <SI style={{ width: 11, height: 11 }} />
                          {s.label}
                        </span>
                      </td>
                      {/* Duration */}
                      <td style={{ padding: "13px 18px" }}>
                        <span style={{ fontSize: 11, color: "#333333" }}>{fmt(p.startDate)} → {fmt(p.endDate)}</span>
                      </td>
                      {/* Team */}
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Network style={{ width: 13, height: 13, color: "#475569" }} />
                          <span style={{ fontSize: 13, color: "#64748b" }}>{p.members.length}</span>
                        </div>
                      </td>
                      {/* Action */}
                      <td style={{ padding: "13px 18px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <Link
                            href={`/projects/${p.id}`}
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#E50914", fontWeight: 600, textDecoration: "none", padding: "5px 12px", borderRadius: 8, background: "#1A0305", border: "1px solid #3a0a10" }}
                          >
                            View <ExternalLink style={{ width: 11, height: 11 }} />
                          </Link>
                          <button
                            onClick={() => promptDelete(p.id, p.title)}
                            disabled={deleting === p.id}
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#f87171", fontWeight: 600, padding: "5px 12px", borderRadius: 8, background: "#1a0505", border: "1px solid #3a0a0a", cursor: "pointer", opacity: deleting === p.id ? 0.5 : 1 }}
                          >
                            {deleting === p.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Delete confirm modal */}
      {confirmDeleteId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#121212", border: "1px solid #3a0a0a", borderRadius: 16, padding: "28px 32px", maxWidth: 400, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#1a0505", border: "1px solid #3a0a0a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", marginBottom: 8 }}>Delete Project?</p>
            <p style={{ fontSize: 13, color: "#475569", marginBottom: 24, lineHeight: 1.5 }}>Are you sure you want to delete <strong style={{ color: "#f87171" }}>&quot;{confirmDeleteTitle}&quot;</strong>? This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmDeleteId(null)}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >Cancel</button>
              <button
                onClick={confirmDelete}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: "#E50914", border: "1px solid #B20710", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 0 14px rgba(229,9,20,0.3)" }}
              >Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
