"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

const inputClass =
  "w-full px-3 py-2.5 bg-[#0f172a] border border-slate-600/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50";
const labelClass = "block text-sm font-medium text-slate-300 mb-1.5";

export default function AddEquipmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    model: "",
    notes: "",
  });

  const set = (field: string, value: string) =>
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
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/equipment"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#2A2A2A] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Equipment</h1>
          <p className="text-slate-400 text-sm mt-0.5">Register a new club equipment item</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="bg-[#2A2A2A] border border-slate-700/50 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Equipment Information</h2>

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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              placeholder="Any additional notes about this equipment..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/equipment"
            className="flex-1 text-center py-2.5 bg-[#2A2A2A] border border-slate-700/50 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : "Add Equipment"}
          </button>
        </div>
      </form>
    </div>
  );
}
