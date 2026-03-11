"use client";

import { ListPlus, Trash2 } from "lucide-react";

export interface TeamMemberRow {
  id: string;
  name: string;
  studentId: string;
  role: string;
  phone: string;
}

interface Props {
  members: TeamMemberRow[];
  onChange: (members: TeamMemberRow[]) => void;
}

const IS: React.CSSProperties = {
  width: "100%",
  background: "#0A0A0A",
  border: "1px solid #2A2A2A",
  borderRadius: 8,
  padding: "8px 11px",
  fontSize: 12,
  color: "#f1f5f9",
  outline: "none",
  fontFamily: "inherit",
};

function focus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "#E50914";
  e.currentTarget.style.boxShadow   = "0 0 0 2px rgba(229,9,20,0.12)";
}
function blur(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "#2A2A2A";
  e.currentTarget.style.boxShadow   = "none";
}

export function TeamMemberFields({ members, onChange }: Props) {
  const add    = () => onChange([...members, { id: crypto.randomUUID(), name: "", studentId: "", role: "", phone: "" }]);
  const remove = (id: string) => onChange(members.filter(m => m.id !== id));
  const update = (id: string, field: keyof Omit<TeamMemberRow, "id">, value: string) =>
    onChange(members.map(m => m.id === id ? { ...m, [field]: value } : m));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {members.map((m, i) => (
        <div
          key={m.id}
          style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 1fr 1fr 36px", gap: 8, alignItems: "center", padding: "12px", background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 10 }}
        >
          {/* Number badge */}
          <div style={{ width: 26, height: 26, borderRadius: 7, background: "#261F06", border: "1px solid #665111", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#FF6B6B" }}>{i + 1}</span>
          </div>

          {/* Name */}
          <input
            type="text"
            placeholder="Full Name"
            value={m.name}
            onChange={e => update(m.id, "name", e.target.value)}
            onFocus={focus} onBlur={blur}
            style={IS}
          />

          {/* Student ID */}
          <input
            type="text"
            placeholder="Student ID"
            value={m.studentId}
            onChange={e => update(m.id, "studentId", e.target.value)}
            onFocus={focus} onBlur={blur}
            style={IS}
          />

          {/* Role */}
          <input
            type="text"
            placeholder="Role (e.g. Director)"
            value={m.role}
            onChange={e => update(m.id, "role", e.target.value)}
            onFocus={focus} onBlur={blur}
            style={IS}
          />

          {/* Phone */}
          <input
            type="tel"
            placeholder="Phone Number"
            value={m.phone}
            onChange={e => update(m.id, "phone", e.target.value)}
            onFocus={focus} onBlur={blur}
            style={IS}
          />

          {/* Remove */}
          <button
            type="button"
            onClick={() => remove(m.id)}
            style={{ width: 30, height: 30, borderRadius: 8, background: "#1f0708", border: "1px solid #7f1d1d", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
            title="Remove member"
          >
            <Trash2 style={{ width: 13, height: 13, color: "#f87171" }} />
          </button>
        </div>
      ))}

      {/* Add button */}
      <button
        type="button"
        onClick={add}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 0", border: "1.5px dashed #1e3a5f", borderRadius: 10, background: "transparent", fontSize: 13, fontWeight: 600, color: "#333333", cursor: "pointer", transition: "all 0.15s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E50914"; (e.currentTarget as HTMLElement).style.color = "#FF6B6B"; (e.currentTarget as HTMLElement).style.background = "#261F0630"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1e3a5f"; (e.currentTarget as HTMLElement).style.color = "#333333"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        <ListPlus style={{ width: 15, height: 15 }} />
        Add Team Member
      </button>
    </div>
  );
}
