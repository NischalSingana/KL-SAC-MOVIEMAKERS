"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { History, ListPlus, Phone, UserCircle, X, Loader2, BadgeCheck, AlertCircle, RotateCcw, Search, Aperture, Minus, Plus } from "lucide-react";

interface Equipment { 
  id: string; 
  name: string; 
  model: string; 
  status: "AVAILABLE" | "BORROWED"; 
  quantity: number;
  borrowLogs: { status: string; returnedAt: string | null }[];
}

interface BorrowLog {
  id: string;
  equipment: { id: string; name: string; model: string };
  borrowerName: string;
  studentId: string;
  phone: string;
  takenAt: string;
  returnedAt: string | null;
  status: "BORROWED" | "RETURNED";
}

function fmtIST(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
}

const iStyle: React.CSSProperties = {
  width: "100%", background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 8,
  padding: "9px 12px", fontSize: 13, color: "#f1f5f9", outline: "none", fontFamily: "inherit",
};
const lStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 };

// Helper to calculate available units
const getAvailableCount = (e: Equipment) => {
  const activeCount = e.borrowLogs?.filter(l => !l.returnedAt).length || 0;
  return e.quantity - activeCount;
};

export default function BorrowPage() {
  const [logs, setLogs]         = useState<BorrowLog[]>([]);
  const [equipment, setEq]      = useState<Equipment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [returning, setReturning] = useState<string | null>(null);
  const [err, setErr]           = useState("");
  const [busy, setBusy]         = useState(false);
  const [eqSearch, setEqSearch] = useState("");

  const [form, setForm]         = useState<{ 
    borrowItems: { id: string, quantity: number }[],
    borrowerName: string, 
    studentId: string, 
    phone: string, 
    takenAt: string 
  }>({ 
    borrowItems: [], borrowerName: "", studentId: "", phone: "", takenAt: "" 
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setSlice = (f: string, v: any) => setForm(p => ({ ...p, [f]: v }));

  const toggleEq = (e: Equipment) => {
    setForm(p => {
      const exists = p.borrowItems.find(i => i.id === e.id);
      if (exists) {
        return { ...p, borrowItems: p.borrowItems.filter(i => i.id !== e.id) };
      } else {
        return { ...p, borrowItems: [...p.borrowItems, { id: e.id, quantity: 1 }] };
      }
    });
  };

  const updateItemQty = (id: string, qty: number) => {
    setForm(p => ({
      ...p,
      borrowItems: p.borrowItems.map(i => i.id === id ? { ...i, quantity: qty } : i)
    }));
  };

  const load = useCallback(async () => {
    const [lo, eq] = await Promise.all([fetch("/api/borrow").then(r => r.json()), fetch("/api/equipment").then(r => r.json())]);
    setLogs(Array.isArray(lo) ? lo : []);
    setEq(Array.isArray(eq) ? eq : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.borrowItems.length === 0 || !form.borrowerName || !form.studentId || !form.phone || !form.takenAt) { 
      setErr("Please complete all fields and select at least one item."); 
      return; 
    }
    setBusy(true); setErr("");
    try {
      const payload = {
        items: form.borrowItems,
        borrowerName: form.borrowerName,
        studentId: form.studentId,
        phone: form.phone,
        takenAt: form.takenAt
      };
      const res = await fetch("/api/borrow", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Failed"); return; }
      setModal(false);
      setForm({ borrowItems: [], borrowerName: "", studentId: "", phone: "", takenAt: "" });
      setEqSearch("");
      await load();
    } catch { setErr("Unexpected error."); }
    finally { setBusy(false); }
  };

  const markReturned = async (id: string) => {
    setReturning(id);
    try { const r = await fetch(`/api/borrow/${id}/return`, { method: "PATCH" }); if (r.ok) await load(); }
    finally { setReturning(null); }
  };

  const active    = logs.filter(l => l.status === "BORROWED").length;
  const returned  = logs.filter(l => l.status === "RETURNED").length;
  
  const availableEqList = useMemo(() => {
    const avail = equipment.filter(e => getAvailableCount(e) > 0);
    if (!eqSearch) return avail;
    const s = eqSearch.toLowerCase();
    return avail.filter(e => e.name.toLowerCase().includes(s) || e.model.toLowerCase().includes(s));
  }, [equipment, eqSearch]);

  return (
    <div style={{ maxWidth: 1320 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 3, height: 20, borderRadius: 4, background: "linear-gradient(#60a5fa,#FF3B3B)", flexShrink: 0 }} />
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>Borrow Logs</h1>
          </div>
          <p style={{ fontSize: 12, color: "#333333", paddingLeft: 11 }}>Track equipment borrowing and returns</p>
        </div>
        <button
          onClick={() => { setModal(true); setErr(""); }}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#fff", background: "#E50914", border: "1px solid #B20710", borderRadius: 10, padding: "8px 16px", cursor: "pointer", boxShadow: "0 0 14px rgba(229,9,20,0.3)" }}
        >
          <ListPlus style={{ width: 14, height: 14 }} /> Log Borrow
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Logs",         value: logs.length, color: "#FF6B6B", bg: "#261F06", icon: History    },
          { label: "Currently Borrowed", value: active,      color: "#f87171", bg: "#1f0708", icon: AlertCircle },
          { label: "Returned",           value: returned,    color: "#34d399", bg: "#022c22", icon: BadgeCheck},
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

      {/* Table */}
      <div style={{ background: "#121212", border: "1px solid #2A2A2A", borderRadius: 14, overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 style={{ width: 24, height: 24, color: "#E50914", animation: "spin 1s linear infinite" }} />
          </div>
        ) : logs.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", gap: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "#1A1A1A", border: "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <History style={{ width: 24, height: 24, color: "#2A2A2A" }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>No borrow logs yet</p>
            <p style={{ fontSize: 12, color: "#333333" }}>Click &quot;Log Borrow&quot; to record the first one</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2A2A2A" }}>
                  {["Equipment", "Borrower", "Phone", "Taken At", "Returned At", "Status", "Action"].map((h, i) => (
                    <th key={h} style={{ padding: "11px 18px", textAlign: i === 6 ? "right" : "left", fontSize: 11, fontWeight: 700, color: "#333333", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #0f172a" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#1A1A1A"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <td style={{ padding: "13px 18px" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{log.equipment.name}</p>
                      <p style={{ fontSize: 11, color: "#333333", marginTop: 2 }}>{log.equipment.model}</p>
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 7, background: "#0c1a2e", border: "1px solid #1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <UserCircle style={{ width: 12, height: 12, color: "#60a5fa" }} />
                        </div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#f1f5f9" }}>{log.borrowerName}</p>
                          <p style={{ fontSize: 10, color: "#333333", fontFamily: "monospace" }}>{log.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Phone style={{ width: 12, height: 12, color: "#475569" }} />
                        <span style={{ fontSize: 12, color: "#64748b" }}>{log.phone}</span>
                      </div>
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      <span style={{ fontSize: 11, color: "#475569" }}>{fmtIST(log.takenAt)}</span>
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      <span style={{ fontSize: 11, color: "#333333" }}>{fmtIST(log.returnedAt)}</span>
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      {log.status === "BORROWED" ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#1f0708", color: "#f87171", border: "1px solid #7f1d1d" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171" }} /> Borrowed
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#022c22", color: "#34d399", border: "1px solid #065f46" }}>
                          <BadgeCheck style={{ width: 11, height: 11 }} /> Returned
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "13px 18px", textAlign: "right" }}>
                      {log.status === "BORROWED" && (
                        <button
                          onClick={() => markReturned(log.id)}
                          disabled={returning === log.id}
                          style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 8, background: "#022c22", color: "#34d399", border: "1px solid #065f46", cursor: "pointer", opacity: returning === log.id ? 0.6 : 1 }}
                        >
                          {returning === log.id ? <Loader2 style={{ width: 11, height: 11, animation: "spin 1s linear infinite" }} /> : <RotateCcw style={{ width: 11, height: 11 }} />}
                          Mark Returned
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Borrow Modal ── */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.75)", backdropFilter: "blur(4px)" }} onClick={() => setModal(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 520, background: "#121212", border: "1px solid #2A2A2A", borderRadius: 16, boxShadow: "0 24px 64px rgba(0,0,0,.8)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
            
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #1A1A1A", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1f0708", border: "1px solid #7f1d1d", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <History style={{ width: 16, height: 16, color: "#f87171" }} />
                </div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9" }}>Log Equipment Borrow</p>
                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>Assign equipment to a student</p>
                </div>
              </div>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", padding: 4 }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <form onSubmit={submit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, overflowY: "auto" }}>
              {err && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1f0708", border: "1px solid #7f1d1d", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#f87171" }}>
                  <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} /> {err}
                </div>
              )}

              {/* Multi-Select Field */}
              <div>
                <label style={lStyle}>Available Equipment (<span style={{color: "#3b82f6"}}>{form.borrowItems.length}</span> selected) *</label>
                
                <div style={{ border: "1px solid #2A2A2A", borderRadius: 12, background: "#0A0A0A", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #1A1A1A", background: "#121212" }}>
                    <Search style={{ width: 14, height: 14, color: "#64748b", flexShrink: 0 }} />
                    <input 
                      type="text" 
                      placeholder="Search equipment..." 
                      value={eqSearch} 
                      onChange={e => setEqSearch(e.target.value)}
                      style={{ background: "transparent", border: "none", outline: "none", color: "#f1f5f9", fontSize: 13, width: "100%", marginLeft: 10 }}
                    />
                  </div>
                  
                  <div style={{ maxHeight: 220, overflowY: "auto", padding: 6 }}>
                    {availableEqList.length === 0 ? (
                      <p style={{ padding: "16px", textAlign: "center", fontSize: 12, color: "#475569" }}>No available equipment found</p>
                    ) : (
                      availableEqList.map(e => {
                        const selectedItem = form.borrowItems.find(i => i.id === e.id);
                        const checked = !!selectedItem;
                        const avail = getAvailableCount(e);
                        
                        return (
                          <div key={e.id} style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 4 }}>
                            <div 
                              onClick={() => toggleEq(e)}
                              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, cursor: "pointer", background: checked ? "#1A1A1A" : "transparent", transition: "all 0.1s", border: checked ? "1px solid #2563eb33" : "1px solid transparent" }} 
                              onMouseEnter={el => {if(!checked) el.currentTarget.style.background = "#121212"}} 
                              onMouseLeave={el => {if(!checked) el.currentTarget.style.background = "transparent"}}
                            >
                              <div style={{ width: 18, height: 18, borderRadius: 4, border: `1px solid ${checked ? "#3b82f6" : "#333333"}`, background: checked ? "#1d4ed8" : "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                {checked && <BadgeCheck style={{ width: 12, height: 12, color: "#fff" }} />}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                <span style={{ fontSize: 13, fontWeight: checked ? 700 : 500, color: checked ? "#f1f5f9" : "#e2e8f0" }}>{e.name}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                                  <span style={{ fontSize: 11, color: "#64748b" }}>{e.model}</span>
                                  <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 4, background: "#1A1A1A", color: "#94a3b8", border: "1px solid #2A2A2A" }}>{avail} available</span>
                                </div>
                              </div>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#121212", border: "1px solid #1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Aperture style={{ width: 14, height: 14, color: "#475569" }} />
                              </div>
                            </div>
                            
                            {/* Quantity Selector for selected item */}
                            {checked && avail > 1 && (
                              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 42, paddingBottom: 8, paddingTop: 4, borderBottom: "1px solid #1A1A1A", marginBottom: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>Quantity:</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 8, padding: "4px 8px" }}>
                                  <button 
                                    type="button" 
                                    onClick={(el) => { el.stopPropagation(); updateItemQty(e.id, Math.max(1, selectedItem.quantity - 1)); }}
                                    style={{ color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}
                                  >
                                    <Minus style={{ width: 12, height: 12 }} />
                                  </button>
                                  <span style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9", minWidth: 16, textAlign: "center" }}>{selectedItem.quantity}</span>
                                  <button 
                                    type="button" 
                                    onClick={(el) => { el.stopPropagation(); updateItemQty(e.id, Math.min(avail, selectedItem.quantity + 1)); }}
                                    style={{ color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}
                                  >
                                    <Plus style={{ width: 12, height: 12 }} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label style={lStyle}>Borrower Name *</label>
                <input type="text" placeholder="Full name" value={form.borrowerName} onChange={e => setSlice("borrowerName", e.target.value)} required style={iStyle} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lStyle}>Student ID *</label>
                  <input type="text" placeholder="e.g. 2200090123" value={form.studentId} onChange={e => setSlice("studentId", e.target.value)} required style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Phone *</label>
                  <input type="tel" placeholder="10-digit number" value={form.phone} onChange={e => setSlice("phone", e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} required style={iStyle} />
                </div>
              </div>

              <div>
                <label style={lStyle}>Taken Date & Time *</label>
                <input type="datetime-local" value={form.takenAt} onChange={e => setSlice("takenAt", e.target.value)} required style={{ ...iStyle, colorScheme: "dark", padding: "10px 12px" }} />
              </div>

              <div style={{ display: "flex", gap: 12, paddingTop: 10, marginTop: 4, borderTop: "1px solid #1A1A1A" }}>
                <button type="button" onClick={() => setModal(false)}
                  style={{ flex: 1, padding: "12px", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#94a3b8", cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={busy}
                  style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", background: "#E50914", border: "1px solid #B20710", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
                  {busy ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Logging Borrow…</> : "Confirm Borrow"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
