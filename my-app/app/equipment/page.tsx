"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Aperture, Boxes, ListPlus, ScanSearch, Loader2, BadgeCheck, AlertCircle, Download } from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  model: string;
  status: "AVAILABLE" | "BORROWED";
  notes: string | null;
  createdAt: string;
  borrowLogs: { borrowerName: string; studentId: string; phone: string; takenAt: string }[];
}


const STAT: Record<string, { label: string; color: string; bg: string; border: string }> = {
  AVAILABLE: { label: "Available", color: "#34d399", bg: "#022c22", border: "#065f46" },
  BORROWED:  { label: "Borrowed",  color: "#f87171", bg: "#1f0708", border: "#7f1d1d" },
};

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statFilter, setStatFilter] = useState("ALL");
  const [selectedBorrower, setSelectedBorrower] = useState<{ borrowerName: string; studentId: string; phone: string; takenAt: string; equipmentName: string } | null>(null);

  useEffect(() => {
    fetch("/api/equipment").then(r => r.json()).then(d => setEquipment(Array.isArray(d) ? d : [])).catch(() => setEquipment([])).finally(() => setLoading(false));
  }, []);

  const available = equipment.filter(e => e.status === "AVAILABLE").length;
  const borrowed  = equipment.filter(e => e.status === "BORROWED").length;

  const filtered = equipment.filter(e => {
    const ms = [e.name, e.model].some(v => v.toLowerCase().includes(search.toLowerCase()));
    const mf = statFilter === "ALL" || e.status === statFilter;
    return ms && mf;
  });

  const exportCSV = () => {
    const rows = filtered.map(e => {
      const borrower = e.borrowLogs?.[0]?.borrowerName ?? "";
      return [`"${e.name}"`, `"${e.model}"`, e.status, `"${borrower}"`].join(",");
    });
    const csv  = [["Name","Model","Status","Borrowed By"].join(","), ...rows].join("\n");
    const a    = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: "equipment.csv" });
    a.click();
  };

  return (
    <div style={{ maxWidth: 1320 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 3, height: 20, borderRadius: 4, background: "linear-gradient(#34d399,#60a5fa)", flexShrink: 0 }} />
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>Equipment</h1>
          </div>
          <p style={{ fontSize: 12, color: "#333333", paddingLeft: 11 }}>Manage cameras and production gear</p>
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
            href="/equipment/add"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#fff", background: "#E50914", border: "1px solid #B20710", borderRadius: 10, padding: "8px 16px", textDecoration: "none", boxShadow: "0 0 14px rgba(229,9,20,0.3)" }}
          >
            <ListPlus style={{ width: 14, height: 14 }} /> Add Equipment
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Items", value: equipment.length, color: "#FF6B6B", bg: "#261F06", icon: Boxes },
          { label: "Available",   value: available,        color: "#34d399", bg: "#022c22", icon: BadgeCheck },
          { label: "Borrowed",    value: borrowed,         color: "#f87171", bg: "#1f0708", icon: AlertCircle  },
        ].map(s => (
          <div key={s.label} style={{ background: "#121212", border: "1px solid #2A2A2A", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon style={{ width: 17, height: 17, color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: 24, fontWeight: 900, color: "#f1f5f9", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 320 }}>
          <ScanSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#333333", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search by name or model..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", background: "#121212", border: "1px solid #2A2A2A", borderRadius: 10, padding: "8px 12px 8px 36px", fontSize: 13, color: "#e2e8f0", outline: "none" }}
            onFocus={e => { e.currentTarget.style.borderColor = "#E50914"; }}
            onBlur={e  => { e.currentTarget.style.borderColor = "#2A2A2A"; }}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["ALL", "AVAILABLE", "BORROWED"].map(f => {
            const active = statFilter === f;
            const meta = f !== "ALL" ? STAT[f] : null;
            return (
              <button key={f} onClick={() => setStatFilter(f)}
                style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 999, cursor: "pointer",
                  background: active ? (meta?.bg ?? "#261F06") : "#121212",
                  color:      active ? (meta?.color ?? "#FF6B6B") : "#475569",
                  border:     `1px solid ${active ? (meta?.border ?? "#665111") : "#2A2A2A"}`,
                }}
              >
                {f === "ALL" ? "All" : STAT[f].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#121212", border: "1px solid #2A2A2A", borderRadius: 14, overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 style={{ width: 24, height: 24, color: "#E50914", animation: "spin 1s linear infinite" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", gap: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "#1A1A1A", border: "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Aperture style={{ width: 24, height: 24, color: "#2A2A2A" }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>No equipment found</p>
            <p style={{ fontSize: 12, color: "#333333" }}>{search ? "Try a different search" : "Add your first piece of equipment"}</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2A2A2A" }}>
                  {["Equipment", "Model", "Status", "Borrowed By"].map((h) => (
                    <th key={h} style={{ padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#333333", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const s = STAT[item.status];
                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid #0f172a" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#1A1A1A"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#0c1a2e", border: "1px solid #1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Aperture style={{ width: 14, height: 14, color: "#60a5fa" }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{item.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <span style={{ fontSize: 12, color: "#475569" }}>{item.model}</span>
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        {item.borrowLogs?.[0] ? (
                          <button
                            onClick={() => setSelectedBorrower({ ...item.borrowLogs[0], equipmentName: item.name })}
                            style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#f87171", textDecoration: "underline", textUnderlineOffset: 3 }}>{item.borrowLogs[0].borrowerName}</span>
                              <span style={{ fontSize: 10, color: "#475569" }}>{item.borrowLogs[0].studentId}</span>
                            </div>
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: "#333333" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Borrower detail modal */}
      {selectedBorrower && (
        <div
          onClick={() => setSelectedBorrower(null)}
          style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: "#121212", border: "1px solid #1e3a5f", borderRadius: 16, padding: "28px 32px", maxWidth: 380, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "#1f0708", border: "1px solid #7f1d1d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#f87171" }}>{selectedBorrower.borrowerName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9" }}>{selectedBorrower.borrowerName}</p>
                <p style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>Currently borrowing</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[{ label: "Equipment", value: selectedBorrower.equipmentName, color: "#60a5fa" },
                { label: "Student ID", value: selectedBorrower.studentId, color: "#f1f5f9" },
                { label: "Phone", value: selectedBorrower.phone, color: "#f1f5f9" },
                { label: "Taken On", value: new Date(selectedBorrower.takenAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }), color: "#fbbf24" },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, background: "#1A1A1A" }}>
                  <span style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>{r.label}</span>
                  <span style={{ fontSize: 12, color: r.color, fontWeight: 700 }}>{r.value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedBorrower(null)}
              style={{ marginTop: 20, width: "100%", padding: "10px 0", borderRadius: 10, background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
