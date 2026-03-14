"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

const inputClass =
  "w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-xl text-[14px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#60a5fa] focus:ring-1 focus:ring-[#60a5fa] transition-all box-border";
const labelClass = "block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2";

export default function AddEquipmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    model: "",
    serialNumber: "",
    notes: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.model.trim() || !form.serialNumber.trim()) {
      setError("Name, model, and serial number are required.");
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
    <div className="max-w-2xl mx-auto space-y-8 pb-20 pt-8">
      {/* Header */}
      <div className="flex items-center gap-5 mb-10">
        <Link
          href="/equipment"
          className="w-11 h-11 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#60a5fa] hover:bg-[#222] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Add Equipment
          </h1>
          <p className="text-slate-400 text-[14px] mt-1.5">Register a new club equipment item into the inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-red-400 text-[14px]">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="bg-[#121212] border border-[#2A2A2A] rounded-2xl p-8 space-y-8 shadow-2xl">
          
          <div>
            <label className={labelClass}>Equipment Name *</label>
            <input
              type="text"
              placeholder="e.g. DSLR Camera"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Model *</label>
              <input
                type="text"
                placeholder="e.g. Canon EOS 90D"
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Serial Number *</label>
              <input
                type="text"
                placeholder="e.g. 1042X8A9"
                value={form.serialNumber}
                onChange={(e) => set("serialNumber", e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              placeholder="Any additional notes about this equipment..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={4}
              className={`${inputClass} resize-none leading-relaxed`}
            />
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <Link
            href="/equipment"
            className="flex-1 text-center py-4 bg-[#1A1A1A] border border-[#333] text-slate-300 hover:text-white rounded-xl text-[15px] font-[600] transition-colors hover:bg-[#222]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-[15px] font-[700] transition-colors"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Saving…</> : "Save to Inventory"}
          </button>
        </div>
      </form>
    </div>
  );
}
