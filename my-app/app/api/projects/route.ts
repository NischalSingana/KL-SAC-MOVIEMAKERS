import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        members: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    const now = new Date();
    const mapped = projects.map((p: { startDate: Date | null; endDate: Date | null }) => {
      let status = "UPCOMING";
      if (!p.startDate) status = "UPCOMING";
      else if (now < p.startDate) status = "UPCOMING";
      else if (p.endDate && now > p.endDate) status = "COMPLETED";
      else status = "ONGOING";
      return { ...p, status };
    });
    return NextResponse.json(mapped);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, type, storySummary, startDate, endDate, permissionLetterUrl, members } = body;

    if (!title) {
      return NextResponse.json({ error: "Project title is required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title,
        type: type || "SHORT_FILM",
        storySummary: storySummary || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        permissionLetterUrl: permissionLetterUrl || null,
        members: {
          create:
            members?.map((m: { name: string; studentId: string; role: string; phone: string }) => ({
              name: m.name,
              studentId: m.studentId,
              role: m.role || "Member",
              phone: m.phone,
            })) ?? [],
        },
      },
      include: { members: true },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (e) {
    console.error("Project create error:", e);
    const msg = e instanceof Error ? e.message : "Failed to create project";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
