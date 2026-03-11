import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export function StatsCard({ title, value, change, trend, icon: Icon, iconColor, iconBg }: StatsCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-slate-400";

  return (
    <div className="bg-[#2A2A2A] border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/30 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span>{change}</span>
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400 mt-1">{title}</p>
      </div>
    </div>
  );
}
