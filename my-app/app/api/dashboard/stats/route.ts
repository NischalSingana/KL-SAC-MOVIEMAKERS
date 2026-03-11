import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel
    const [
      allProjects,
      allEquipment,
      recentBorrows,
      upcomingDeadlines,
    ] = await Promise.all([
      prisma.project.findMany({
        include: { members: { select: { id: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.equipment.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.borrowLog.findMany({
        include: { equipment: { select: { name: true, model: true } } },
        orderBy: { takenAt: "desc" },
        take: 5,
      }),
      prisma.project.findMany({
        where: {
          endDate: { gte: now, lte: thirtyDaysFromNow },
        },
        orderBy: { endDate: "asc" },
        take: 5,
      }),
    ]);

    // Compute status helper
    const getStatus = (sDate: Date | null, eDate: Date | null) => {
      if (!sDate) return "UPCOMING";
      if (now < sDate) return "UPCOMING";
      if (eDate && now > eDate) return "COMPLETED";
      return "ONGOING";
    };

    allProjects.forEach((p: { status?: string, startDate: Date | null, endDate: Date | null }) => {
      p.status = getStatus(p.startDate, p.endDate);
    });

    // Project counts
    const projectCounts = {
      total: allProjects.length,
      upcoming: allProjects.filter((p: { status?: string }) => p.status === "UPCOMING").length,
      ongoing: allProjects.filter((p: { status?: string }) => p.status === "ONGOING").length,
      completed: allProjects.filter((p: { status?: string }) => p.status === "COMPLETED").length,
    };

    // Type counts
    const typeCounts = {
      SHORT_FILM: allProjects.filter((p: { type: string }) => p.type === "SHORT_FILM").length,
      COVER_SONG: allProjects.filter((p: { type: string }) => p.type === "COVER_SONG").length,
      DOCUMENTARY: allProjects.filter((p: { type: string }) => p.type === "DOCUMENTARY").length,
    };

    // Equipment counts
    const equipmentCounts = {
      total: allEquipment.length,
      available: allEquipment.filter((e: { status: string }) => e.status === "AVAILABLE").length,
      borrowed: allEquipment.filter((e: { status: string }) => e.status === "BORROWED").length,
    };

    // Monthly activity — last 6 months
    const monthlyActivity: { month: string; projects: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      const count = allProjects.filter((p: { createdAt: Date }) => {
        const c = new Date(p.createdAt);
        return c >= d && c < next;
      }).length;
      monthlyActivity.push({ month: label, projects: count });
    }

    // Recent projects (last 5)
    const recentProjects = allProjects.slice(0, 5).map((p: { id: string; title: string; type: string; status?: string; members: { id: string }[]; createdAt: Date }) => ({
      id: p.id,
      title: p.title,
      type: p.type,
      status: p.status,
      memberCount: p.members.length,
      createdAt: p.createdAt,
    }));

    const upcomingDeadlinesComputed = upcomingDeadlines.map((p: { id: string; title: string; status?: string; startDate: Date | null; endDate: Date | null }) => ({
      ...p,
      status: getStatus(p.startDate, p.endDate),
    }));

    return NextResponse.json({
      projectCounts,
      typeCounts,
      equipmentCounts,
      monthlyActivity,
      recentProjects,
      recentBorrows,
      upcomingDeadlines: upcomingDeadlinesComputed,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
