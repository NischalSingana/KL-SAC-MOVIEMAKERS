import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const log = await prisma.borrowLog.findUnique({ where: { id } });
    if (!log) return NextResponse.json({ error: "Borrow log not found" }, { status: 404 });
    if (log.status === "RETURNED") {
      return NextResponse.json({ error: "Already returned" }, { status: 409 });
    }

    // IST = UTC+5:30
    const nowUtc = new Date();
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const returnedAtIST = new Date(nowUtc.getTime() + istOffsetMs);

    const [updated] = await prisma.$transaction([
      prisma.borrowLog.update({
        where: { id },
        data: {
          status: "RETURNED",
          returnedAt: returnedAtIST,
        },
        include: { equipment: true },
      }),
      prisma.equipment.update({
        where: { id: log.equipmentId },
        data: { status: "AVAILABLE" },
      }),
    ]);

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to mark returned" }, { status: 500 });
  }
}
