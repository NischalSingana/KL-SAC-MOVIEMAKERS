"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Ticket, MicVocal, Hourglass, Zap, BadgeCheck,
  ScrollText, Network, CalendarDays, Trash2, Loader2, AlertCircle,
  ExternalLink, Phone, Hash, Projector, Pencil, X, Save,
} from "lucide-react";
import { FileUpload } from "@/components/forms/file-upload";
import { TeamMemberFields, TeamMemberRow } from "@/components/forms/team-member-fields";

interface TeamMember { id: string; name: string; studentId: string; role: string; phone: string; }
interface Project {
  id: string; title: string;
  type: "SHORT_FILM" | "COVER_SONG" | "DOCUMENTARY";
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
  storySummary: string | null;
  startDate: string | null; endDate: string | null;
  permissionLetterUrl: string | null;
  pastPermissionUrls: string[];
  members: TeamMember[]; createdAt: string;
}

const STATUS: Record<string, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
  UPCOMING:  { label: "Upcoming",  color: "#60a5fa", bg: "#0c1a2e", border: "#1e3a5f", Icon: Hourglass      },
  ONGOING:   { label: "Ongoing",   color: "#fbbf24", bg: "#1c1100", border: "#78350f", Icon: Zap   },
  COMPLETED: { label: "Completed", color: "#34d399", bg: "#022c22", border: "#065f46", Icon: BadgeCheck },
};
const TYPE: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  SHORT_FILM:  { label: "Short Film",   color: "#FF6B6B", bg: "#261F06", Icon: Ticket    },
  COVER_SONG:  { label: "Cover Song",   color: "#f472b6", bg: "#500724", Icon: MicVocal  },
  DOCUMENTARY: { label: "Documentary",  color: "#34d399", bg: "#022c22", Icon: Projector },
};

const IS: React.CSSProperties = {
  width: "100%", background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 10,
  padding: "10px 14px", fontSize: 13, color: "#f1f5f9", outline: "none", fontFamily: "inherit",
};
const LS: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 7 };

function fmt(d: string | null) {
  if (!d) return "Not set";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}
function toDateInput(d: string | null) {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}
function nameColor(name: string) {
  const colors = ["#FF6B6B","#f472b6","#34d399","#60a5fa","#fbbf24","#FF3B3B","#f87171"];
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function ProjectDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();

  const [project, setProject]   = useState<Project | null>(null);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [loadErr, setLoadErr]   = useState("");

  // ── Edit state ────────────────────────────────────────────────
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveErr, setSaveErr]   = useState("");

  const [editForm, setEditForm] = useState({
    title: "", type: "SHORT_FILM", storySummary: "", startDate: "", endDate: "",
  });
  const [editPermUrl, setEditPermUrl]   = useState("");
  const [editMembers, setEditMembers]   = useState<TeamMemberRow[]>([]);

  // ── Extend modal state ─────────────────────────────────────────
  const [showExtend, setShowExtend]       = useState(false);
  const [extendDate, setExtendDate]       = useState("");
  const [extendPermUrl, setExtendPermUrl] = useState("");
  const [extending, setExtending]         = useState(false);

  // ─── Load project ──────────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(d => { if (d.error) setLoadErr(d.error); else setProject(d); })
      .catch(() => setLoadErr("Failed to load project"))
      .finally(() => setLoading(false));
  }, [id]);

  // ─── Enter edit mode ───────────────────────────────────────────
  const startEdit = () => {
    if (!project) return;
    setEditForm({
      title:        project.title,
      type:         project.type,
      storySummary: project.storySummary ?? "",
      startDate:    toDateInput(project.startDate),
      endDate:      toDateInput(project.endDate),
    });
    setEditPermUrl(project.permissionLetterUrl ?? "");
    setEditMembers(project.members.map(m => ({ id: m.id, name: m.name, studentId: m.studentId, role: m.role ?? "", phone: m.phone })));
    setSaveErr("");
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setSaveErr(""); };

  // ─── Save edits ────────────────────────────────────────────────
  const saveEdit = async () => {
    if (!editForm.title.trim()) { setSaveErr("Project title is required."); return; }
    setSaving(true); setSaveErr("");
    try {
      // Archive old permission letter if changed
      const permissionLetterUrl = editPermUrl || project?.permissionLetterUrl || null;
      const pastPermissionUrls  = [...(project?.pastPermissionUrls ?? [])];
      if (project?.permissionLetterUrl && editPermUrl && editPermUrl !== project.permissionLetterUrl) {
        pastPermissionUrls.push(project.permissionLetterUrl);
      }

      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:        editForm.title,
          type:         editForm.type,
          storySummary: editForm.storySummary || null,
          startDate:    editForm.startDate || null,
          endDate:      editForm.endDate || null,
          permissionLetterUrl,
          pastPermissionUrls,
          members: editMembers.filter(m => m.name && m.studentId && m.phone),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveErr(data.error || "Failed to save"); return; }

      // Reload
      const r2 = await fetch(`/api/projects/${id}`);
      const d2 = await r2.json();
      setProject(d2);
      setEditing(false);
    } catch { setSaveErr("Unexpected error. Please try again."); }
    finally { setSaving(false); }
  };

  // ─── Delete ────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.push("/projects");
  };

  // ─── Extend ────────────────────────────────────────────────────
  const handleExtend = async () => {
    if (!extendDate && !extendPermUrl) return setShowExtend(false);
    setExtending(true);
    await fetch(`/api/projects/${id}/extend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endDate: extendDate || project?.endDate, permissionLetterUrl: extendPermUrl }),
    });
    const r = await fetch(`/api/projects/${id}`);
    const d = await r.json();
    setProject(d);
    setShowExtend(false); setExtending(false); setExtendDate(""); setExtendPermUrl("");
  };

  // ─── Render states ─────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 280 }}>
      <Loader2 style={{ width: 26, height: 26, color: "#E50914", animation: "spin 1s linear infinite" }} />
    </div>
  );
  if (loadErr || !project) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 280, gap: 12 }}>
      <AlertCircle style={{ width: 28, height: 28, color: "#f87171" }} />
      <p style={{ fontSize: 14, color: "#475569" }}>{loadErr || "Project not found"}</p>
      <Link href="/projects" style={{ fontSize: 13, color: "#E50914", fontWeight: 600, textDecoration: "none" }}>← Back to Projects</Link>
    </div>
  );

  const s  = STATUS[project.status];
  const t  = TYPE[project.type];
  const SI = s.Icon;
  const TI = t.Icon;

  const typeOpts = [
    { value: "SHORT_FILM",   label: "Short Film",   icon: Ticket,    color: "#FF6B6B", bg: "#261F06", border: "#665111" },
    { value: "DOCUMENTARY",  label: "Documentary",  icon: Projector, color: "#34d399", bg: "#022c22", border: "#065f46" },
    { value: "COVER_SONG",   label: "Cover Song",   icon: MicVocal,  color: "#f472b6", bg: "#500724", border: "#9d174d" },
  ];

  const focusS = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = "#E50914"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(229,9,20,0.1)"; };
  const blurS  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.boxShadow = "none"; };

  // ─────────────────────────────────────────────────────────────
  //  EDIT MODE
  // ─────────────────────────────────────────────────────────────
  if (editing) {
    const ET = TYPE[editForm.type] || t;
    const ETI = ET.Icon;
    return (
      <div style={{ maxWidth: 860 }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={cancelEdit}
              style={{ width: 36, height: 36, borderRadius: 10, background: "#121212", border: "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <ArrowLeft style={{ width: 16, height: 16, color: "#64748b" }} />
            </button>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: ET.bg, border: `1px solid ${ET.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ETI style={{ width: 18, height: 18, color: ET.color }} />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>Edit Project</h1>
              <p style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{project.title}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={cancelEdit}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: 10, background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#64748b", cursor: "pointer" }}
            >
              <X style={{ width: 13, height: 13 }} /> Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={saving}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, padding: "9px 18px", borderRadius: 10, background: "#E50914", border: "1px solid #B20710", color: "#fff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, boxShadow: "0 0 14px rgba(229,9,20,0.3)" }}
            >
              {saving ? <Loader2 style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} /> : <Save style={{ width: 13, height: 13 }} />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Error */}
        {saveErr && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#1f0708", border: "1px solid #7f1d1d", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#f87171", marginBottom: 16 }}>
            <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} /> {saveErr}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* ── Project Details ── */}
          <div style={{ background: "#121212", border: "1px solid #2A2A2A", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", borderBottom: "1px solid #2A2A2A" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "#261F06", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ticket style={{ width: 14, height: 14, color: "#FF6B6B" }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Project Details</p>
              </div>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Title */}
              <div>
                <label style={LS}>Project Title <span style={{ color: "#f87171" }}>*</span></label>
                <input
                  type="text" placeholder="e.g. The Last Frame"
                  value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                  style={IS} onFocus={focusS} onBlur={blurS}
                />
              </div>

              {/* Type */}
              <div>
                <label style={LS}>Project Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {typeOpts.map(o => (
                    <button
                      key={o.value} type="button"
                      onClick={() => setEditForm(p => ({ ...p, type: o.value }))}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                        borderRadius: 10, cursor: "pointer", textAlign: "left",
                        background: editForm.type === o.value ? o.bg : "#0A0A0A",
                        border: `1.5px solid ${editForm.type === o.value ? o.border : "#2A2A2A"}`,
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${o.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <o.icon style={{ width: 14, height: 14, color: o.color }} />
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: editForm.type === o.value ? o.color : "#64748b" }}>{o.label}</p>
                      {editForm.type === o.value && (
                        <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: o.color, boxShadow: `0 0 8px ${o.color}` }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Story summary */}
              <div>
                <label style={LS}>Story Summary</label>
                <textarea
                  placeholder="Brief description of the project..."
                  value={editForm.storySummary}
                  onChange={e => setEditForm(p => ({ ...p, storySummary: e.target.value }))}
                  rows={4}
                  style={{ ...IS, resize: "none", lineHeight: 1.6 }}
                  onFocus={focusS} onBlur={blurS}
                />
              </div>

              {/* Dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LS}>Start Date</label>
                  <input type="date" value={editForm.startDate} onChange={e => setEditForm(p => ({ ...p, startDate: e.target.value }))}
                    style={{ ...IS, colorScheme: "dark" }} onFocus={focusS} onBlur={blurS} />
                </div>
                <div>
                  <label style={LS}>End Date</label>
                  <input type="date" value={editForm.endDate} onChange={e => setEditForm(p => ({ ...p, endDate: e.target.value }))}
                    style={{ ...IS, colorScheme: "dark" }} onFocus={focusS} onBlur={blurS} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Permission Letter ── */}
          <div style={{ background: "#121212", border: "1px solid #2A2A2A", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", borderBottom: "1px solid #2A2A2A" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "#022c22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ScrollText style={{ width: 14, height: 14, color: "#34d399" }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Permission Letter</p>
                <p style={{ fontSize: 11, color: "#333333", marginTop: 1 }}>Upload new letter or keep existing one</p>
              </div>
            </div>
            <div style={{ padding: 20 }}>
              {editPermUrl && editPermUrl === project.permissionLetterUrl && (
                <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 10, background: "#022c22", border: "1px solid #065f46", borderRadius: 10, padding: "10px 14px" }}>
                  <ScrollText style={{ width: 14, height: 14, color: "#34d399", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#34d399" }}>Current letter on file</p>
                    <a href={editPermUrl} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 11, color: "#065f46", textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {editPermUrl}
                    </a>
                  </div>
                  <a href={editPermUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#34d399", textDecoration: "none" }}>
                    View <ExternalLink style={{ width: 10, height: 10 }} />
                  </a>
                </div>
              )}
              <p style={{ fontSize: 12, color: "#475569", marginBottom: 10 }}>
                {editPermUrl ? "Upload a new file to replace the current letter:" : "Upload official permission letter (PDF/DOC):"}
              </p>
              <FileUpload onUploadComplete={setEditPermUrl} />
            </div>
          </div>

          {/* ── Team Members ── */}
          <div style={{ background: "#121212", border: "1px solid #2A2A2A", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", borderBottom: "1px solid #2A2A2A" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "#0c1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Network style={{ width: 14, height: 14, color: "#60a5fa" }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Team Members</p>
                <p style={{ fontSize: 11, color: "#333333", marginTop: 1 }}>Add, remove or modify members</p>
              </div>
            </div>
            <div style={{ padding: 20 }}>
              <TeamMemberFields members={editMembers} onChange={setEditMembers} />
            </div>
          </div>

          {/* Save/Cancel row */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={cancelEdit}
              style={{ flex: 1, padding: "11px 0", borderRadius: 12, background: "#121212", border: "1px solid #2A2A2A", fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              onClick={saveEdit} disabled={saving}
              style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 0", background: "#E50914", border: "1px solid #B20710", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#fff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, boxShadow: "0 0 18px rgba(229,9,20,0.3)" }}
            >
              {saving ? <><Loader2 style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} /> Saving…</> : <><Save style={{ width: 15, height: 15 }} /> Save Changes</>}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  VIEW MODE
  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 860 }}>

      {/* ── Top bar ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/projects"
            style={{ width: 36, height: 36, borderRadius: 10, background: "#121212", border: "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, textDecoration: "none" }}
          >
            <ArrowLeft style={{ width: 16, height: 16, color: "#64748b" }} />
          </Link>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: t.bg, border: `1px solid ${t.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TI style={{ width: 18, height: 18, color: t.color }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>{project.title}</h1>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                <SI style={{ width: 11, height: 11 }} /> {s.label}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>{t.label}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            onClick={startEdit}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, padding: "8px 14px", borderRadius: 10, background: "#0c1a2e", color: "#60a5fa", border: "1px solid #1e3a5f", cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#0f2544"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#0c1a2e"; }}
          >
            <Pencil style={{ width: 13, height: 13 }} /> Edit
          </button>
          <button
            onClick={handleDelete} disabled={deleting}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, padding: "8px 14px", borderRadius: 10, background: "#1f0708", color: "#f87171", border: "1px solid #7f1d1d", cursor: "pointer", opacity: deleting ? 0.6 : 1 }}
          >
            {deleting ? <Loader2 style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} /> : <Trash2 style={{ width: 13, height: 13 }} />}
            Delete
          </button>
        </div>
      </div>

      {/* ── Info cards row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>

        {/* Duration */}
        <div style={{ background: "#121212", border: "1px solid #2A2A2A", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: "#261F06", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CalendarDays style={{ width: 12, height: 12, color: "#FF6B6B" }} />
            </div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#333333", textTransform: "uppercase", letterSpacing: "0.07em" }}>Duration</p>
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{fmt(project.startDate)}</p>
          <p style={{ fontSize: 11, color: "#333333", marginTop: 3 }}>to {fmt(project.endDate)}</p>
        </div>

        {/* Team size */}
        <div style={{ background: "#121212", border: "1px solid #2A2A2A", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: "#0c1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Network style={{ width: 12, height: 12, color: "#60a5fa" }} />
            </div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#333333", textTransform: "uppercase", letterSpacing: "0.07em" }}>Team Size</p>
          </div>
          <p style={{ fontSize: 26, fontWeight: 900, color: "#f1f5f9", lineHeight: 1 }}>{project.members.length}</p>
          <p style={{ fontSize: 11, color: "#333333", marginTop: 3 }}>members</p>
        </div>

        {/* Permission letter */}
        <div style={{ background: "#121212", border: "1px solid #2A2A2A", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: "#022c22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ScrollText style={{ width: 12, height: 12, color: "#34d399" }} />
              </div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#333333", textTransform: "uppercase", letterSpacing: "0.07em" }}>Permissions</p>
            </div>
            <button
              onClick={() => setShowExtend(true)}
              style={{ fontSize: 10, fontWeight: 700, background: "#022c22", color: "#34d399", border: "1px solid #065f46", padding: "4px 8px", borderRadius: 6, cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#064e3b")}
              onMouseLeave={e => (e.currentTarget.style.background = "#022c22")}
            >
              Extend
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {project.permissionLetterUrl ? (
              <a
                href={project.permissionLetterUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#34d399", textDecoration: "none", padding: "5px 10px", background: "#022c22", border: "1px solid #065f46", borderRadius: 8, alignSelf: "flex-start" }}
              >
                Current Letter <ExternalLink style={{ width: 11, height: 11 }} />
              </a>
            ) : (
              <p style={{ fontSize: 12, color: "#2A2A2A" }}>No current letter</p>
            )}

            {project.pastPermissionUrls && project.pastPermissionUrls.length > 0 && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed #2A2A2A" }}>
                <p style={{ fontSize: 10, color: "#475569", marginBottom: 6 }}>Previous Letters</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {project.pastPermissionUrls.map((url, i) => (
                    <a
                      key={i} href={url} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#94a3b8", textDecoration: "none", padding: "4px 8px", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 6 }}
                    >
                      Archive {i + 1} <ExternalLink style={{ width: 9, height: 9 }} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Story summary ── */}
      {project.storySummary && (
        <div style={{ background: "#121212", border: "1px solid #2A2A2A", borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <div style={{ width: 3, height: 14, borderRadius: 4, background: "#E50914" }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: "#333333", textTransform: "uppercase", letterSpacing: "0.07em" }}>Story Summary</p>
          </div>
          <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{project.storySummary}</p>
        </div>
      )}

      {/* ── Team members ── */}
      <div style={{ background: "#121212", border: "1px solid #2A2A2A", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #2A2A2A" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#0c1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Network style={{ width: 13, height: 13, color: "#60a5fa" }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Team Members</p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#0c1a2e", color: "#60a5fa", border: "1px solid #1e3a5f" }}>
            {project.members.length} {project.members.length === 1 ? "member" : "members"}
          </span>
        </div>

        {project.members.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#1A1A1A", border: "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Network style={{ width: 18, height: 18, color: "#2A2A2A" }} />
            </div>
            <p style={{ fontSize: 13, color: "#2A2A2A" }}>No team members added yet</p>
            <button
              onClick={startEdit}
              style={{ fontSize: 13, color: "#60a5fa", fontWeight: 600, background: "none", border: "none", cursor: "pointer", marginTop: 4 }}
            >
              + Add members
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "40px 1.5fr 1fr 1fr 140px", padding: "9px 20px", borderBottom: "1px solid #0f172a" }}>
              {["#", "Name", "Role", "Student ID", "Phone"].map(h => (
                <p key={h} style={{ fontSize: 10, fontWeight: 700, color: "#333333", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</p>
              ))}
            </div>
            {project.members.map((m, i) => {
              const ac = nameColor(m.name);
              return (
                <div
                  key={m.id}
                  style={{ display: "grid", gridTemplateColumns: "40px 1.5fr 1fr 1fr 140px", padding: "11px 20px", borderBottom: "1px solid #0f172a", alignItems: "center" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#1A1A1A"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <span style={{ fontSize: 12, color: "#1e3a5f", fontWeight: 600 }}>{i + 1}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${ac}20`, border: `1px solid ${ac}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 800, color: ac }}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{m.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>{m.role || "Member"}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Hash style={{ width: 11, height: 11, color: "#333333" }} />
                    <span style={{ fontSize: 12, color: "#475569", fontFamily: "monospace" }}>{m.studentId}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Phone style={{ width: 11, height: 11, color: "#333333" }} />
                    <span style={{ fontSize: 12, color: "#475569" }}>{m.phone}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Extend Permission Modal ── */}
      {showExtend && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }} onClick={() => setShowExtend(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 440, background: "#121212", border: "1px solid #2A2A2A", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9" }}>Extend Permission</h3>
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Edit end date & upload new letter.</p>
              </div>
              <button onClick={() => setShowExtend(false)} style={{ width: 28, height: 28, borderRadius: 8, background: "#1A1A1A", border: "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#94a3b8" }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>New End Date</label>
                <input
                  type="date" value={extendDate} onChange={e => setExtendDate(e.target.value)}
                  style={{ width: "100%", background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#f1f5f9", outline: "none", colorScheme: "dark" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#E50914"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#2A2A2A"; }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>New Permission Letter</label>
                <FileUpload onUploadComplete={setExtendPermUrl} />
              </div>
            </div>
            <div style={{ padding: "16px 20px", borderTop: "1px solid #2A2A2A", display: "flex", gap: 12, background: "#090c10" }}>
              <button onClick={() => setShowExtend(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: "#1A1A1A", border: "1px solid #2A2A2A", fontSize: 13, fontWeight: 600, color: "#94a3b8", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleExtend} disabled={extending} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", borderRadius: 10, background: "#E50914", border: "none", fontSize: 13, fontWeight: 700, color: "#fff", cursor: extending ? "not-allowed" : "pointer", opacity: extending ? 0.7 : 1 }}>
                {extending ? <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
