"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, AlertCircle, Plus, Minus, Info, Camera,
  Sparkles
} from "lucide-react";

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

export default function AddEquipmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    model: "",
    quantity: 1,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.model.trim()) {
      setError("Name and model are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to add equipment"); return; }
      router.push("/equipment");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", paddingBottom: "60px" }}>
      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, marginTop: 20 }}>
        <Link
          href="/equipment"
          style={{ width: 36, height: 36, borderRadius: 10, background: "#121212", border: "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}
        >
          <ArrowLeft style={{ width: 16, height: 16, color: "#64748b" }} />
        </Link>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#E50914,#FF3B3B)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 14px rgba(229,9,20,0.35)" }}>
          <Sparkles style={{ width: 16, height: 16, color: "#fff" }} />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>Register Equipment</h1>
          <p style={{ fontSize: 12, color: "#333333", marginTop: 2 }}>Add new production equipment to inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#1f0708", border: "1px solid #7f1d1d", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#f87171" }}>
            <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} /> {error}
          </div>
        )}

        {/* ── Core Details ── */}
        <SectionCard icon={Camera} iconColor="#FF6B6B" iconBg="#261F06" title="Equipment Information">
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={LS}>Equipment Name <span style={{ color: "#f87171" }}>*</span></label>
              <input
                type="text"
                placeholder="e.g. DSLR Camera"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                style={IS}
                onFocus={e => { e.currentTarget.style.borderColor = "#E50914"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(229,9,20,0.1)"; }}
                onBlur={e  => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={LS}>Model <span style={{ color: "#f87171" }}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Canon EOS 90D"
                  value={form.model}
                  onChange={(e) => set("model", e.target.value)}
                  required
                  style={IS}
                  onFocus={e => { e.currentTarget.style.borderColor = "#E50914"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(229,9,20,0.1)"; }}
                  onBlur={e  => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label style={LS}>Quantity</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 10, padding: "5px 10px", width: "fit-content" }}>
                  <button
                    type="button"
                    onClick={() => set("quantity", Math.max(1, form.quantity - 1))}
                    style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #2A2A2A", background: "#121212", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#333"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#2A2A2A"}
                  >
                    <Minus style={{ width: 12, height: 12 }} />
                  </button>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9", minWidth: 20, textAlign: "center" }}>{form.quantity}</span>
                  <button
                    type="button"
                    onClick={() => set("quantity", Math.min(10, form.quantity + 1))}
                    style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #2A2A2A", background: "#121212", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#333"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#2A2A2A"}
                  >
                    <Plus style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: -10 }}>
              <Info style={{ width: 12, height: 12, color: "#333" }} />
              <p style={{ fontSize: 10, color: "#333", fontWeight: 500 }}>Max 10 items per entry for batch management</p>
            </div>
          </div>
        </SectionCard>


        {/* ── Submit row ── */}
        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
          <Link
            href="/equipment"
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 0", background: "#121212", border: "1px solid #2A2A2A", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#64748b", textDecoration: "none", textAlign: "center" }}
          >
            Cancel
          </Link>
          <button
            type="submit" disabled={loading}
            style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", background: "#E50914", border: "1px solid #B20710", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#fff", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: "0 0 18px rgba(229,9,20,0.3)" }}
          >
            {loading ? <><Loader2 style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} /> Saving…</> : <><Sparkles style={{ width: 15, height: 15 }} /> Register Equipment</>}
          </button>
        </div>
      </form>
    </div>
  );
}
