"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput } from "@fullcalendar/core";
import { Loader2, CalendarDays, Ticket, Aperture, Hourglass, BadgeCheck, Zap } from "lucide-react";

interface Project {
  id: string; title: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
  type: string; startDate: string | null; endDate: string | null;
}
interface BorrowLog {
  id: string; borrowerName: string; takenAt: string;
  returnedAt: string | null; status: string;
  equipment: { name: string };
}

const STATUS_COLORS: Record<string, string> = {
  UPCOMING:  "#E50914",
  ONGOING:   "#f59e0b",
  COMPLETED: "#10b981",
};

const LEGEND = [
  { color: "#E50914", bg: "#261F06", border: "#665111", icon: Hourglass,         label: "Upcoming"  },
  { color: "#f59e0b", bg: "#1c1100", border: "#78350f", icon: Zap,    label: "Ongoing"   },
  { color: "#10b981", bg: "#022c22", border: "#065f46", icon: BadgeCheck, label: "Completed" },
  { color: "#ef4444", bg: "#1f0708", border: "#7f1d1d", icon: Aperture,        label: "Borrowed"  },
];

export default function CalendarPage() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ projects: 0, borrows: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then(r => r.json()),
      fetch("/api/borrow").then(r => r.json()),
    ])
      .then(([projects, borrows]) => {
        const p = Array.isArray(projects) ? projects : [];
        const b = Array.isArray(borrows)  ? borrows  : [];

        const pEvents: EventInput[] = p
          .filter((pr: Project) => pr.startDate)
          .map((pr: Project) => ({
            id: `proj-${pr.id}`,
            title: pr.title,
            start: pr.startDate!,
            end: pr.endDate || undefined,
            backgroundColor: STATUS_COLORS[pr.status] ?? "#E50914",
            borderColor: "transparent",
            url: `/projects/${pr.id}`,
            extendedProps: { type: "project", status: pr.status, icon: "🎬" },
          }));

        const bEvents: EventInput[] = b
          .filter((bl: BorrowLog) => bl.status === "BORROWED")
          .map((bl: BorrowLog) => ({
            id: `borrow-${bl.id}`,
            title: `${bl.equipment.name} → ${bl.borrowerName}`,
            start: bl.takenAt,
            end: bl.returnedAt || undefined,
            backgroundColor: "#ef4444",
            borderColor: "transparent",
            extendedProps: { type: "borrow", icon: "📷" },
          }));

        setEvents([...pEvents, ...bEvents]);
        setCounts({ projects: pEvents.length, borrows: bEvents.length });
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 1320 }}>
      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 3, height: 20, borderRadius: 4, background: "linear-gradient(#fbbf24,#FF6B6B)", flexShrink: 0 }} />
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>Calendar</h1>
          </div>
          <p style={{ fontSize: 12, color: "#333333", paddingLeft: 11 }}>Project schedules and equipment reservations</p>
        </div>

        {/* Legend pill row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {LEGEND.map(l => (
            <span key={l.label} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: l.bg, color: l.color, border: `1px solid ${l.border}` }}>
              <l.icon style={{ width: 11, height: 11 }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Stat strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Events",    value: counts.projects + counts.borrows, color: "#FF6B6B", bg: "#261F06", icon: CalendarDays },
          { label: "Project Events",  value: counts.projects,                  color: "#E50914", bg: "#261F06", icon: Ticket         },
          { label: "Active Borrows",  value: counts.borrows,                   color: "#f87171", bg: "#1f0708", icon: Aperture       },
        ].map(s => (
          <div key={s.label} style={{ background: "#121212", border: "1px solid #2A2A2A", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon style={{ width: 16, height: 16, color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#f1f5f9", lineHeight: 1 }}>{loading ? "…" : s.value}</p>
              <p style={{ fontSize: 11, color: "#475569", marginTop: 3 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Calendar card ── */}
      <div style={{ background: "#121212", border: "1px solid #2A2A2A", borderRadius: 16, padding: "20px 20px 24px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
            <Loader2 style={{ width: 26, height: 26, color: "#E50914", animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <div className="dark-calendar">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left:   "prev,next today",
                center: "title",
                right:  "dayGridMonth,dayGridWeek",
              }}
              events={events}
              height="auto"
              aspectRatio={1.8}
              dayMaxEvents={3}
              moreLinkContent={args => `+${args.num} more`}
              eventClick={(info) => {
                if (info.event.url) {
                  info.jsEvent.preventDefault();
                  window.location.href = info.event.url;
                }
              }}
              eventMouseEnter={(info) => {
                (info.el as HTMLElement).style.opacity = "0.8";
                (info.el as HTMLElement).style.transform = "scale(1.02)";
                (info.el as HTMLElement).style.cursor = "pointer";
              }}
              eventMouseLeave={(info) => {
                (info.el as HTMLElement).style.opacity = "1";
                (info.el as HTMLElement).style.transform = "scale(1)";
              }}
              eventContent={(eventInfo) => (
                <div style={{
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}>
                  {eventInfo.event.extendedProps.type === "project" ? "🎬" : "📷"} {eventInfo.event.title}
                </div>
              )}
            />
          </div>
        )}
      </div>

      {/* ── FullCalendar dark override styles ── */}
      <style>{`
        .dark-calendar .fc {
          color: #94a3b8;
          font-family: inherit;
        }
        .dark-calendar .fc table, .dark-calendar .fc td, .dark-calendar .fc th {
          border-color: #2A2A2A !important;
        }
        .dark-calendar .fc .fc-scrollgrid { border-color: #2A2A2A !important; }
        .dark-calendar .fc .fc-toolbar-title {
          font-size: 15px; font-weight: 800; color: #f1f5f9;
        }
        .dark-calendar .fc .fc-button {
          background: #1A1A1A !important; border: 1px solid #2A2A2A !important;
          color: #94a3b8 !important; border-radius: 8px !important;
          font-size: 12px !important; font-weight: 600 !important;
          padding: 5px 12px !important; box-shadow: none !important;
        }
        .dark-calendar .fc .fc-button:hover {
          background: #2A2A2A !important; color: #f1f5f9 !important;
        }
        .dark-calendar .fc .fc-button-active,
        .dark-calendar .fc .fc-button-primary:not(:disabled).fc-button-active {
          background: #E50914 !important; border-color: #E50914 !important;
          color: #fff !important;
        }
        .dark-calendar .fc .fc-button-primary:not(:disabled):active {
          background: #B20710 !important;
        }
        .dark-calendar .fc .fc-col-header-cell-cushion {
          color: #333333; font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.07em;
          padding: 8px 4px;
        }
        .dark-calendar .fc .fc-daygrid-day-number {
          color: #475569; font-size: 12px; font-weight: 600; padding: 6px 8px;
        }
        .dark-calendar .fc .fc-day-today { background: rgba(229,9,20,0.06) !important; }
        .dark-calendar .fc .fc-day-today .fc-daygrid-day-number {
          color: #FF6B6B; font-weight: 800;
        }
        .dark-calendar .fc .fc-daygrid-day:hover { background: rgba(255,255,255,0.02) !important; }
        .dark-calendar .fc .fc-more-link {
          color: #475569; font-size: 10px; font-weight: 700;
        }
        .dark-calendar .fc .fc-more-link:hover { color: #FF6B6B; }
        .dark-calendar .fc-theme-standard .fc-popover {
          background: #1A1A1A; border: 1px solid #2A2A2A;
          border-radius: 10px; box-shadow: 0 12px 32px rgba(0,0,0,.5);
        }
        .dark-calendar .fc-theme-standard .fc-popover-header {
          background: #121212; color: #94a3b8; font-size: 12px; font-weight: 700;
          padding: 8px 12px; border-bottom: 1px solid #2A2A2A; border-radius: 10px 10px 0 0;
        }
        .dark-calendar .fc .fc-event,
        .dark-calendar .fc .fc-daygrid-event {
          border-radius: 5px !important; border: none !important;
          transition: opacity 0.15s, transform 0.15s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
        }
        .dark-calendar .fc .fc-h-event { border: none !important; }
        .dark-calendar .fc .fc-toolbar.fc-header-toolbar {
          margin-bottom: 16px; gap: 8px;
        }
        .dark-calendar .fc .fc-button-group { gap: 4px; display: flex; }
        .dark-calendar .fc .fc-button-group > .fc-button { border-radius: 8px !important; }
      `}</style>
    </div>
  );
}
