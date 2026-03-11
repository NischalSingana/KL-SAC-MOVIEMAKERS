import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { endDate, permissionLetterUrl } = await req.json();

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const newPastUrls = [...project.pastPermissionUrls];
    if (project.permissionLetterUrl && project.permissionLetterUrl !== permissionLetterUrl) {
      newPastUrls.push(project.permissionLetterUrl);
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        endDate: endDate ? new Date(endDate) : project.endDate,
        permissionLetterUrl: permissionLetterUrl || project.permissionLetterUrl,
        pastPermissionUrls: newPastUrls,
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to extend project permission" }, { status: 500 });
  }
}
