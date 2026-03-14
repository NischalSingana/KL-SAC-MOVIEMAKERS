"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput } from "@fullcalendar/core";
import { Loader2, CalendarDays, Ticket, Aperture, Hourglass, BadgeCheck, Zap } from "lucide-react";
import { format, addDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

interface CalendarEvent {
  title?: string;
  url?: string;
  backgroundColor?: string;
  bg?: string;
  extendedProps?: {
    url?: string;
    actualStart?: string | null;
    actualEnd?: string | null;
    type?: string;
  };
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);

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
            // FullCalendar treats dates exclusively, so we add 1 day to the end date so it spans correctly visually
            end: pr.endDate ? format(addDays(new Date(pr.endDate), 1), "yyyy-MM-dd") : undefined,
            backgroundColor: STATUS_COLORS[pr.status] ?? "#E50914",
            borderColor: "transparent",
            url: `/projects/${pr.id}`,
            extendedProps: { 
              type: "project", 
              status: pr.status, 
              icon: "🎬",
              actualStart: pr.startDate,
              actualEnd: pr.endDate 
            },
          }));

        const bEvents: EventInput[] = b
          .filter((bl: BorrowLog) => bl.status === "BORROWED")
          .map((bl: BorrowLog) => ({
            id: `borrow-${bl.id}`,
            title: `${bl.equipment.name} → ${bl.borrowerName}`,
            start: bl.takenAt,
            end: bl.returnedAt ? format(addDays(new Date(bl.returnedAt), 1), "yyyy-MM-dd") : undefined,
            backgroundColor: "#ef4444",
            borderColor: "transparent",
            extendedProps: { 
              type: "borrow", 
              icon: "📷",
              actualStart: bl.takenAt,
              actualEnd: bl.returnedAt
            },
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
              dayMaxEvents={5}
              moreLinkContent={(info) => {
                return <span style={{ color: "#E50914" }}>+ {info.num} more</span>;
              }}
              moreLinkClick={(info) => {
                setSelectedDate(info.date);
                setSelectedEvents(info.allSegs.map(seg => seg.event));
                setIsModalOpen(true);
                return "prevent"; 
              }}
              dateClick={(info) => {
                const dateStr = format(info.date, "yyyy-MM-dd");
                const dayEvents = events.filter(e => {
                  const eventStart = typeof e.start === 'string' ? e.start.split('T')[0] : "";
                  const eventEnd = typeof e.end === 'string' ? e.end.split('T')[0] : eventStart;
                  return dateStr >= eventStart && dateStr <= eventEnd;
                });
                
                if (dayEvents.length > 0) {
                  setSelectedDate(info.date);
                  setSelectedEvents(dayEvents as CalendarEvent[]);
                  setIsModalOpen(true);
                }
              }}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent 
          className="sm:max-w-[450px] p-0 overflow-hidden" 
          style={{ 
            background: "#0F0F0F", 
            border: "1px solid #222", 
            borderRadius: 20,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
          }}
        >
          {/* Header with Background Accent */}
          <div style={{ position: "relative", padding: "28px 24px 20px", borderBottom: "1px solid #1A1A1A" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "radial-gradient(circle at 0% 0%, #E5091415, transparent 60%)", pointerEvents: "none" }} />
            <DialogHeader>
              <DialogTitle style={{ fontSize: 18, fontWeight: 900, color: "#fff", display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ color: "#E50914", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.15em", fontWeight: 800 }}>Daily Overview</span>
                {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : ""}
              </DialogTitle>
              <p style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>Scheduled productions and logistics for today.</p>
            </DialogHeader>
          </div>

          {/* Event List */}
          <div className="custom-scrollbar" style={{ padding: "16px 20px 24px", display: "flex", flexDirection: "column", gap: 12, maxHeight: "60vh", overflowY: "auto" }}>
            {selectedEvents.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "#333" }}>
                <CalendarDays style={{ width: 32, height: 32, margin: "0 auto 12px", opacity: 0.2 }} />
                <p style={{ fontSize: 13, fontWeight: 600 }}>No entries scheduled</p>
              </div>
            ) : (
              selectedEvents.map((event, idx) => {
                const type = event.extendedProps?.type;
                const isProject = type === "project";
                const url = event.url || (event.extendedProps?.url);
                const color = event.backgroundColor || "#E50914";
                
                return (
                  <div 
                    key={idx} 
                    onClick={() => { if (url) window.location.href = url; }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "#181818";
                      (e.currentTarget as HTMLElement).style.borderColor = "#333";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "#141414";
                      (e.currentTarget as HTMLElement).style.borderColor = "#222";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                    style={{ 
                      display: "flex", 
                      alignItems: "stretch", 
                      background: "#141414", 
                      border: "1px solid #222", 
                      borderRadius: 14, 
                      overflow: "hidden",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: url ? "pointer" : "default"
                    }}
                  >
                    {/* Status Indicator */}
                    <div style={{ width: 4, background: color, boxShadow: `0 0 10px ${color}40` }} />
                    
                    <div style={{ flex: 1, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                      {/* Icon Container */}
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: isProject ? "#1c0b0b" : "#1a0505", border: `1px solid ${isProject ? "#4b1c1c" : "#3a0a0a"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {isProject ? <Ticket size={18} color="#FF3B3B" /> : <Aperture size={18} color="#ef4444" />}
                      </div>

                      {/* Info */}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 9, fontWeight: 800, color: color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{isProject ? "Production" : "Equipment"}</span>
                        </div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{event.title}</h4>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#475569" }}>
                            <CalendarDays size={12} style={{ opacity: 0.6 }} />
                            {event.extendedProps?.actualStart ? format(new Date(event.extendedProps.actualStart), "MMM d") : "-"}
                          </div>
                          <div style={{ width: 4, height: 1, background: "#2A2A2A" }} />
                          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#475569" }}>
                            <Hourglass size={12} style={{ opacity: 0.6 }} />
                            {event.extendedProps?.actualEnd ? format(new Date(event.extendedProps.actualEnd), "MMM d") : "-"}
                          </div>
                        </div>
                      </div>

                      {/* Detail Hint */}
                      {url && (
                        <div style={{ color: "#2A2A2A", display: "flex", alignItems: "center" }}>
                          <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 8, color: "#333" }}>Details</span>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#E50914" }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

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
          color: #475569; font-size: 10.5px; font-weight: 700; background: #1f0708; padding: 2px 6px; border-radius: 4px; border: 1px solid #7f1d1d;
        }
        .dark-calendar .fc .fc-more-link:hover { color: #FF6B6B; border-color: #E50914;}
        .dark-calendar .fc-theme-standard .fc-popover {
          display: none; /* We handle it via custom modal */
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

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
}
