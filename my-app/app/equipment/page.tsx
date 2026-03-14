"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Aperture, Boxes, ListPlus, ScanSearch, Loader2, BadgeCheck, AlertCircle, Download, Pencil, X, Check, Minus, Plus } from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  model: string;
  serialNumber: string | null;
  status: "AVAILABLE" | "BORROWED";
  quantity: number;
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

  // Edit modal state
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [editForm, setEditForm] = useState({ name: "", model: "", status: "AVAILABLE", quantity: 1 });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  const fetchEquipment = () => {
    fetch("/api/equipment").then(r => r.json()).then(d => setEquipment(Array.isArray(d) ? d : [])).catch(() => setEquipment([])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchEquipment(); }, []);

  const totalItems = equipment.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalBorrowed = equipment.reduce((acc, curr) => acc + curr.borrowLogs.length, 0);
  const totalAvailable = totalItems - totalBorrowed;

  const filtered = equipment.filter(e => {
    const ms = [e.name, e.model].some(v => v.toLowerCase().includes(search.toLowerCase()));
    const mf = statFilter === "ALL" || (statFilter === "AVAILABLE" ? e.borrowLogs.length < e.quantity : e.borrowLogs.length > 0);
    return ms && mf;
  });

  const exportCSV = () => {
    const rows = filtered.map(e => {
      const borrowers = e.borrowLogs.map(b => b.borrowerName).join("; ");
      return [`"${e.name}"`, `"${e.model}"`, `${e.quantity - e.borrowLogs.length}/${e.quantity}`, `"${borrowers}"`].join(",");
    });
    const csv  = [["Name","Model","Available","Borrowed By"].join(","), ...rows].join("\n");
    const a    = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: "equipment.csv" });
    a.click();
  };

  const openEdit = (item: Equipment) => {
    setEditingItem(item);
    setEditForm({ name: item.name, model: item.model, status: item.status, quantity: item.quantity });
    setEditError("");
    setEditSuccess(false);
  };

  const closeEdit = () => {
    setEditingItem(null);
    setEditError("");
    setEditSuccess(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditLoading(true);
    setEditError("");
    try {
      const res = await fetch(`/api/equipment/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.error || "Failed to update equipment"); return; }
      setEditSuccess(true);
      setEquipment(prev => prev.map(eq => eq.id === editingItem.id ? { ...eq, ...editForm } as Equipment : eq));
      setTimeout(() => closeEdit(), 1200);
    } catch {
      setEditError("An unexpected error occurred.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    if (!confirm("Are you sure you want to delete this equipment? This will also delete all associated borrow history.")) return;
    
    setEditLoading(true);
    setEditError("");
    try {
      const res = await fetch(`/api/equipment/${editingItem.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setEditError(data.error || "Failed to delete equipment");
        return;
      }
      setEquipment(prev => prev.filter(eq => eq.id !== editingItem.id));
      closeEdit();
    } catch {
      setEditError("Failed to delete equipment. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const inputSt: React.CSSProperties = { width: "100%", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none", boxSizing: "border-box" };
  const labelSt: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 5 };

  return (
    <div style={{ maxWidth: 1320 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 3, height: 20, borderRadius: 4, background: "linear-gradient(#E50914,#ff4d4d)", flexShrink: 0 }} />
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>Equipment Inventory</h1>
          </div>
          <p style={{ fontSize: 12, color: "#475569", paddingLeft: 11 }}>Manage cameras and production equipment by quantity</p>
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
          { label: "Total Units", value: totalItems, color: "#FF6B6B", bg: "#261F06", icon: Boxes },
          { label: "Available",   value: totalAvailable, color: "#34d399", bg: "#022c22", icon: BadgeCheck },
          { label: "Borrowed",    value: totalBorrowed,  color: "#f87171", bg: "#1f0708", icon: AlertCircle  },
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
            <p style={{ fontSize: 12, color: "#333333" }}>{search ? "Try a different search" : "Register your first piece of equipment"}</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2A2A2A" }}>
                  {["Equipment", "Model", "Availability", "Active Borrowers", ""].map((h) => (
                    <th key={h} style={{ padding: "14px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#333333", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const borrowedCount = item.borrowLogs.length;
                  const availableCount = item.quantity - borrowedCount;
                  const isAvailable = availableCount > 0;
                  const s = isAvailable ? STAT.AVAILABLE : STAT.BORROWED;
                  
                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid #1A1A1A" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#0A0A0A"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <td style={{ padding: "16px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1A0305", border: "1px solid #3a0a10", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Aperture style={{ width: 16, height: 16, color: "#E50914" }} />
                          </div>
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", display: "block" }}>{item.name}</span>
                            {item.quantity > 1 && <span style={{ fontSize: 11, color: "#475569" }}>Stock: {item.quantity} units</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 18px" }}>
                        <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{item.model}</span>
                      </td>
                      <td style={{ padding: "16px 18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: s.bg, color: s.color, border: `1px solid ${s.border}`, width: "fit-content" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
                            {isAvailable ? "Available" : "All Borrowed"}
                          </span>
                          <span style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginLeft: 4 }}>
                            {availableCount} of {item.quantity} available
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 18px" }}>
                        {item.borrowLogs.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {item.borrowLogs.map((log, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedBorrower({ ...log, equipmentName: item.name })}
                                style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, display: "block" }}
                              >
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#f87171", textDecoration: "underline", textUnderlineOffset: 3, textDecorationColor: "#7f1d1d" }}>
                                  {log.borrowerName}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "#333333" }}>None</span>
                        )}
                      </td>
                      <td style={{ padding: "16px 18px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => openEdit(item)}
                            title="Edit equipment"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 10, background: "#1A1A1A", border: "1px solid #262626", color: "#94a3b8", cursor: "pointer", transition: "all 0.2s" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E50914"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#262626"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}
                          >
                            <Pencil style={{ width: 12, height: 12 }} /> Edit
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

      {/* Borrower detail modal */}
      {selectedBorrower && (
        <div
          onClick={() => setSelectedBorrower(null)}
          style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: "#0A0A0A", border: "1px solid #262626", borderRadius: 24, padding: "32px", maxWidth: 400, width: "95%", boxShadow: "0 30px 60px rgba(0,0,0,0.8)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: "#1A0305", border: "2px solid #3a0a10", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: "#f87171" }}>{selectedBorrower.borrowerName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{selectedBorrower.borrowerName}</p>
                <p style={{ fontSize: 13, color: "#475569", marginTop: 2, fontWeight: 500 }}>Current Borrower</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[{ label: "Equipment", value: selectedBorrower.equipmentName, color: "#E50914" },
                { label: "Student ID", value: selectedBorrower.studentId, color: "#f1f5f9" },
                { label: "Phone", value: selectedBorrower.phone, color: "#f1f5f9" },
                { label: "Taken On", value: new Date(selectedBorrower.takenAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }), color: "#fbbf24" },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, background: "#111" }}>
                  <span style={{ fontSize: 13, color: "#475569", fontWeight: 700 }}>{r.label}</span>
                  <span style={{ fontSize: 13, color: r.color, fontWeight: 800 }}>{r.value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedBorrower(null)}
              style={{ marginTop: 28, width: "100%", padding: "12px 0", borderRadius: 14, background: "#1A1A1A", border: "1px solid #262626", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#222")}
              onMouseLeave={e => (e.currentTarget.style.background = "#1A1A1A")}
            >Close Details</button>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {editingItem && (
        <div
          onClick={closeEdit}
          style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: "#0A0A0A", border: "1px solid #262626", borderRadius: 24, padding: "32px", maxWidth: 500, width: "95%", boxShadow: "0 30px 90px rgba(0,0,0,0.8)", maxHeight: "90vh", overflowY: "auto" }}>
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "#1A0305", border: "1px solid #3a0a10", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Pencil style={{ width: 18, height: 18, color: "#E50914" }} />
                </div>
                <div>
                  <p style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>Edit Equipment</p>
                  <p style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{editingItem.name}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={editLoading}
                  style={{ background: "#1A0305", border: "1px solid #3a0a10", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 800, color: "#f87171", cursor: "pointer", transition: "all 0.2s", opacity: editLoading ? 0.6 : 1 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#2a0a10")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#1A0305")}
                >
                  Delete
                </button>
                <button onClick={closeEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 6, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "#475569"}>
                  <X style={{ width: 22, height: 22 }} />
                </button>
              </div>
            </div>

            {editSuccess ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0", gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#022c22", border: "2px solid #065f46", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check style={{ width: 32, height: 32, color: "#34d399" }} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Changes Saved</p>
                <p style={{ fontSize: 13, color: "#475569" }}>Inventory updated successfully</p>
              </div>
            ) : (
              <form onSubmit={handleEdit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {editError && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#1A0305", border: "1px solid #3a0a10", borderRadius: 12, padding: "12px 16px" }}>
                    <AlertCircle style={{ width: 16, height: 16, color: "#f87171", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#f87171", fontWeight: 500 }}>{editError}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <label style={labelSt}>Equipment Name</label>
                  <input
                    value={editForm.name}
                    onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                    required
                    style={inputSt}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {/* Model */}
                  <div className="space-y-1.5">
                    <label style={labelSt}>Model</label>
                    <input
                      value={editForm.model}
                      onChange={e => setEditForm(p => ({ ...p, model: e.target.value }))}
                      required
                      style={inputSt}
                    />
                  </div>
                  {/* Quantity */}
                  <div className="space-y-1.5">
                    <label style={labelSt}>Quantity</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 10, padding: "5px 10px" }}>
                       <button type="button" onClick={() => setEditForm(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer" }}><Minus size={14}/></button>
                       <span style={{ fontSize: 14, fontWeight: 800, color: "#fff", minWidth: 20, textAlign: "center" }}>{editForm.quantity}</span>
                       <button type="button" onClick={() => setEditForm(p => ({ ...p, quantity: Math.min(50, p.quantity + 1) }))} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer" }}><Plus size={14}/></button>
                    </div>
                  </div>
                </div>


                {/* Actions */}
                <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
                  <button
                    type="button"
                    onClick={closeEdit}
                    style={{ flex: 1, padding: "12px 0", borderRadius: 14, background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#94a3b8", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >Cancel</button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", borderRadius: 14, background: "#E50914", border: "1px solid #B20710", color: "#fff", fontSize: 13, fontWeight: 800, cursor: editLoading ? "not-allowed" : "pointer", opacity: editLoading ? 0.7 : 1, boxShadow: "0 8px 16px rgba(229,9,20,0.2)" }}
                  >
                    {editLoading
                      ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Saving…</>
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
