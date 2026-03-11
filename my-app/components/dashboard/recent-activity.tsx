import { Film, Camera, BookOpen, Calendar, User } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "project",
    icon: Film,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-600/20",
    title: "New project created",
    description: "\"Short Film: The Last Frame\" was created by Arjun Kumar",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "borrow",
    icon: Camera,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-600/20",
    title: "Equipment borrowed",
    description: "Sony FX3 Camera borrowed by Priya Sharma for Documentary Project",
    time: "4 hours ago",
  },
  {
    id: 3,
    type: "return",
    icon: BookOpen,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-600/20",
    title: "Equipment returned",
    description: "Rode VideoMic Pro returned by Ravi Patel",
    time: "Yesterday",
  },
  {
    id: 4,
    type: "event",
    icon: Calendar,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-600/20",
    title: "Event scheduled",
    description: "Monthly club meeting scheduled for March 15th",
    time: "Yesterday",
  },
  {
    id: 5,
    type: "member",
    icon: User,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-600/20",
    title: "New member joined",
    description: "Ananya Singh joined the club",
    time: "2 days ago",
  },
];

export function RecentActivity() {
  return (
    <div className="bg-[#2A2A2A] border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold">Recent Activity</h3>
          <p className="text-slate-400 text-xs mt-0.5">Latest club updates</p>
        </div>
      </div>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex items-start gap-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.iconBg}`}>
              <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{activity.title}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{activity.description}</p>
            </div>
            <p className="text-xs text-slate-500 flex-shrink-0">{activity.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
