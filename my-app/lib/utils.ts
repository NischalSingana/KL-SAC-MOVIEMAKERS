import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM dd, yyyy");
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "MMM dd, yyyy 'at' h:mm a");
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function generateKey(prefix: string, fileName: string): string {
  const timestamp = Date.now();
  const ext = fileName.split(".").pop();
  return `${prefix}/${timestamp}.${ext}`;
}

export const STATUS_COLORS = {
  PLANNING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  IN_PRODUCTION: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  POST_PRODUCTION: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
  ON_HOLD: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  AVAILABLE: "bg-green-500/20 text-green-400 border-green-500/30",
  BORROWED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  MAINTENANCE: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  RETIRED: "bg-red-500/20 text-red-400 border-red-500/30",
  ACTIVE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  RETURNED: "bg-green-500/20 text-green-400 border-green-500/30",
  OVERDUE: "bg-red-500/20 text-red-400 border-red-500/30",
} as const;
