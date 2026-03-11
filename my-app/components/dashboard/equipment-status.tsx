"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "Available", value: 22, color: "#10b981" },
  { name: "Borrowed", value: 8, color: "#f59e0b" },
  { name: "Maintenance", value: 3, color: "#f97316" },
  { name: "Retired", value: 1, color: "#ef4444" },
];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-slate-700 rounded-lg p-3 shadow-lg">
        <p className="text-white text-sm font-semibold">{payload[0].name}: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function EquipmentStatus() {
  return (
    <div className="bg-[#2A2A2A] border border-slate-700/50 rounded-xl p-5">
      <div className="mb-5">
        <h3 className="text-white font-semibold">Equipment Status</h3>
        <p className="text-slate-400 text-xs mt-0.5">Current inventory breakdown</p>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-slate-400">{item.name}</span>
            <span className="text-xs text-white font-medium ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
