import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: { members: { orderBy: { createdAt: "asc" } } },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const now = new Date();
    let computedStatus = "UPCOMING";
    if (project.startDate) {
      if (now < project.startDate) computedStatus = "UPCOMING";
      else if (project.endDate && now > project.endDate) computedStatus = "COMPLETED";
      else computedStatus = "ONGOING";
    }
    return NextResponse.json({ ...project, status: computedStatus });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, type, storySummary, startDate, endDate, permissionLetterUrl, pastPermissionUrls, members } = body;

    // Fetch existing to merge pastPermissionUrls
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Replace all members
    await prisma.teamMember.deleteMany({ where: { projectId: id } });

    const project = await prisma.project.update({
      where: { id },
      data: {
        title,
        type,
        storySummary: storySummary || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        permissionLetterUrl: permissionLetterUrl ?? existing.permissionLetterUrl,
        pastPermissionUrls: pastPermissionUrls ?? existing.pastPermissionUrls,
        members: {
          create:
            members?.map((m: { name: string; studentId: string; role?: string; phone: string }) => ({
              name: m.name,
              studentId: m.studentId,
              role: m.role || "Member",
              phone: m.phone,
            })) ?? [],
        },
      },
      include: { members: true },
    });
    return NextResponse.json(project);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
