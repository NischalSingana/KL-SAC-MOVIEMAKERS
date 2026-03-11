"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Ticket, Music2, Aperture, History, Hourglass, Zap,
  BadgeCheck, ArrowUpRight, AlertCircle, Loader2,
  CalendarDays, UserCircle, Boxes, Trophy, Projector,
} from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

interface Stats {
  projectCounts: { total: number; upcoming: number; ongoing: number; completed: number };
  typeCounts: { SHORT_FILM: number; COVER_SONG: number; DOCUMENTARY: number };
  equipmentCounts: { total: number; available: number; borrowed: number };
  monthlyActivity: { month: string; projects: number }[];
  recentProjects: { id: string; title: string; type: string; status: string; memberCount: number; createdAt: string }[];
  recentBorrows: { id: string; borrowerName: string; studentId: string; takenAt: string; equipment: { name: string; model: string } }[];
  upcomingDeadlines: { id: string; title: string; status: string; endDate: string }[];
}

const Tip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#121212", border: "1px solid #2A2A2A", borderRadius: 8, padding: "8px 12px" }}>
      {label && <p style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>{p.name}: <span style={{ color: "#FF6B6B" }}>{p.value}</span></p>
      ))}
    </div>
  );
};

function KPI({ label, value, icon: Icon, color, delay = 0 }: { label: string; value: number; icon: React.ElementType; color: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }}
      style={{ background: "#121212", border: "1px solid #2A2A2A", borderRadius: 12, padding: 16, position: "relative", overflow: "hidden" }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <Icon style={{ width: 17, height: 17, color }} />
      </div>
      <p style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
        <AnimatedCounter value={value} />
      </p>
      <p style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>{label}</p>
    </motion.div>
  );
}

function PanelCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }}
      style={{ background: "#121212", border: "1px solid #2A2A2A", borderRadius: 14, padding: 20 }}
    >
      {children}
    </motion.div>
  );
}

function PanelTitle({ title, sub, badge, viewAll }: { title: string; sub?: string; badge?: string; viewAll?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{title}</p>
        {sub && <p style={{ fontSize: 11, color: "#333333", marginTop: 2 }}>{sub}</p>}
      </div>
      {badge && <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: "#261F06", color: "#FF6B6B", border: "1px solid #665111", whiteSpace: "nowrap" }}>{badge}</span>}
      {viewAll && (
        <Link href={viewAll} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#E50914", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
          View all <ArrowUpRight style={{ width: 12, height: 12 }} />
        </Link>
      )}
    </div>
  );
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

const SM: Record<string, { label: string; color: string; bg: string }> = {
  UPCOMING:  { label: "Upcoming",  color: "#FF6B6B", bg: "#261F06" },
  ONGOING:   { label: "Ongoing",   color: "#fbbf24", bg: "#1c1100" },
  COMPLETED: { label: "Completed", color: "#34d399", bg: "#022c22" },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats").then(r => r.json()).then(d => setStats(d.error ? null : d)).catch(() => setStats(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 320, gap: 12 }}>
      <Loader2 style={{ width: 28, height: 28, color: "#E50914", animation: "spin 1s linear infinite" }} />
      <p style={{ fontSize: 13, color: "#333333" }}>Loading…</p>
    </div>
  );

  if (!stats) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 320, gap: 10 }}>
      <AlertCircle style={{ width: 28, height: 28, color: "#2A2A2A" }} />
      <p style={{ fontSize: 13, color: "#333333", fontWeight: 600 }}>No database connected</p>
      <p style={{ fontSize: 12, color: "#2A2A2A", textAlign: "center" }}>Set <code style={{ color: "#FF6B6B" }}>DATABASE_URL</code> in .env.local</p>
    </div>
  );

  const { projectCounts, typeCounts, equipmentCounts, monthlyActivity, recentProjects, recentBorrows, upcomingDeadlines } = stats;

  const pie = [
    { name: "Upcoming",  value: projectCounts.upcoming,  color: "#E50914" },
    { name: "Ongoing",   value: projectCounts.ongoing,   color: "#f59e0b" },
    { name: "Completed", value: projectCounts.completed, color: "#10b981" },
  ].filter(d => d.value > 0);

  const bars = [
    { name: "Short Films", value: typeCounts.SHORT_FILM, fill: "#E50914" },
    { name: "Documentaries", value: typeCounts.DOCUMENTARY, fill: "#10b981" },
    { name: "Cover Songs", value: typeCounts.COVER_SONG, fill: "#ec4899" },
  ];

  return (
    <div style={{ maxWidth: 1320 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 3, height: 20, borderRadius: 4, background: "linear-gradient(#E50914,#FF3B3B)" }} />
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>Dashboard</h1>
            </div>
            <p style={{ fontSize: 12, color: "#333333", paddingLeft: 11 }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* KPI row 1 - Projects */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 12 }}>
        <KPI label="Total Projects"  value={projectCounts.total}      icon={Ticket}       color="#FF6B6B" delay={0}    />
        <KPI label="Ongoing"         value={projectCounts.ongoing}    icon={Zap}          color="#fbbf24" delay={0.06} />
        <KPI label="Upcoming"        value={projectCounts.upcoming}   icon={Hourglass}    color="#60a5fa" delay={0.12} />
        <KPI label="Completed"       value={projectCounts.completed}  icon={Trophy}       color="#34d399" delay={0.18} />
      </div>

      {/* KPI row 2 - Equipment */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        <KPI label="Total Equipment" value={equipmentCounts.total}    icon={Boxes}        color="#FF3B3B" delay={0.22} />
        <KPI label="In Use"          value={equipmentCounts.borrowed} icon={Aperture}     color="#f87171" delay={0.26} />
        <KPI label="Available"       value={equipmentCounts.available}icon={BadgeCheck}   color="#34d399" delay={0.30} />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        <PanelCard delay={0.35}>
          <PanelTitle title="Project Activity" sub="New projects per month" badge="Last 6 months" />
          <ResponsiveContainer width="100%" height={185}>
            <AreaChart data={monthlyActivity} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#E50914" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#E50914" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#333333", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#333333", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="projects" name="Projects" stroke="#E50914" strokeWidth={2} fill="url(#ag)" dot={{ r: 3, fill: "#E50914", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#FF6B6B" }} />
            </AreaChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard delay={0.38}>
          <PanelTitle title="Project Status" sub="By status" />
          {pie.length === 0 ? (
            <div style={{ height: 130, display: "flex", alignItems: "center", justifyContent: "center", color: "#2A2A2A", fontSize: 13 }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={pie} cx="50%" cy="50%" innerRadius={34} outerRadius={54} paddingAngle={4} dataKey="value">
                  {pie.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                </Pie>
                <Tooltip content={<Tip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {[
              { label: "Upcoming", color: "#E50914", val: projectCounts.upcoming },
              { label: "Ongoing",  color: "#f59e0b", val: projectCounts.ongoing  },
              { label: "Completed",color: "#10b981", val: projectCounts.completed},
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#475569", flex: 1 }}>{s.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>{s.val}</span>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

        {/* Bar chart */}
        <PanelCard delay={0.42}>
          <PanelTitle title="Project Types" sub="Films vs Songs" />
          <ResponsiveContainer width="100%" height={155}>
            <BarChart data={bars} margin={{ top: 0, right: 4, left: -26, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#333333", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#333333", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="value" name="Count" radius={[5, 5, 0, 0]} maxBarSize={56}>
                {bars.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>

        {/* Recent projects */}
        <PanelCard delay={0.46}>
          <PanelTitle title="Recent Projects" sub="Latest additions" viewAll="/projects" />
          {recentProjects.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 0", gap: 8 }}>
              <Ticket style={{ width: 28, height: 28, color: "#2A2A2A" }} />
              <p style={{ fontSize: 12, color: "#2A2A2A" }}>No projects yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {recentProjects.map(p => {
                const isFilm = p.type === "SHORT_FILM";
                const isDoc = p.type === "DOCUMENTARY";
                const Icon = isFilm ? Ticket : isDoc ? Projector : Music2;
                const s = SM[p.status] ?? SM.UPCOMING;
                return (
                  <Link key={p.id} href={`/projects/${p.id}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: "#1A1A1A", textDecoration: "none" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: isFilm ? "#261F06" : isDoc ? "#022c22" : "#500724", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon style={{ width: 14, height: 14, color: isFilm ? "#FF6B6B" : isDoc ? "#34d399" : "#f472b6" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                      <p style={{ fontSize: 11, color: "#333333", marginTop: 2 }}>{p.memberCount} members · {fmt(p.createdAt)}</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: s.bg, color: s.color, flexShrink: 0, whiteSpace: "nowrap" }}>{s.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </PanelCard>

        {/* Deadlines + Borrows */}
        <PanelCard delay={0.50}>
          {/* Deadlines */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#1c1100", border: "1px solid #451a03", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CalendarDays style={{ width: 13, height: 13, color: "#fbbf24" }} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>Upcoming Deadlines</p>
                <p style={{ fontSize: 10, color: "#333333" }}>Next 30 days</p>
              </div>
            </div>
            {upcomingDeadlines.length === 0 ? (
              <p style={{ fontSize: 11, color: "#2A2A2A", textAlign: "center", padding: "8px 0" }}>No upcoming deadlines</p>
            ) : upcomingDeadlines.map(d => (
              <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, background: "#1A1A1A", marginBottom: 4 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</p>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24", flexShrink: 0 }}>{fmt(d.endDate!)}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "#2A2A2A", marginBottom: 16 }} />

          {/* Borrows */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#0c1a2e", border: "1px solid #1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <History style={{ width: 13, height: 13, color: "#60a5fa" }} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>Recent Borrows</p>
                <p style={{ fontSize: 10, color: "#333333" }}>Equipment checkouts</p>
              </div>
            </div>
            {recentBorrows.length === 0 ? (
              <p style={{ fontSize: 11, color: "#2A2A2A", textAlign: "center", padding: "8px 0" }}>No borrows logged yet</p>
            ) : recentBorrows.map(b => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, background: "#1A1A1A", marginBottom: 4 }}>
                <UserCircle style={{ width: 13, height: 13, color: "#60a5fa", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.borrowerName}</p>
                  <p style={{ fontSize: 10, color: "#333333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.equipment.name}</p>
                </div>
                <span style={{ fontSize: 10, color: "#1e3a5f", flexShrink: 0 }}>{fmt(b.takenAt)}</span>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
    </div>
  );
}
