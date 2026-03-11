"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Oct", projects: 4 },
  { month: "Nov", projects: 6 },
  { month: "Dec", projects: 5 },
  { month: "Jan", projects: 8 },
  { month: "Feb", projects: 7 },
  { month: "Mar", projects: 8 },
];

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-slate-700 rounded-lg p-3 shadow-lg">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-white text-sm font-semibold">{payload[0].value} projects</p>
      </div>
    );
  }
  return null;
};

export function ProjectsOverview() {
  return (
    <div className="bg-[#2A2A2A] border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold">Projects Overview</h3>
          <p className="text-slate-400 text-xs mt-0.5">Monthly project activity</p>
        </div>
        <span className="text-xs text-indigo-400 bg-indigo-600/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
          Last 6 months
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="projectGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E50914" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#E50914" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="projects"
            stroke="#E50914"
            strokeWidth={2}
            fill="url(#projectGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
