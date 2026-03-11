import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const logs = await prisma.borrowLog.findMany({
      include: {
        equipment: { select: { id: true, name: true, model: true } },
      },
      orderBy: { takenAt: "desc" },
    });
    return NextResponse.json(logs);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch borrow logs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { equipmentId, borrowerName, studentId, phone, takenAt } = body;

    if (!equipmentId || !borrowerName || !studentId || !phone || !takenAt) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const equip = await prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (!equip) return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
    if (equip.status === "BORROWED") {
      return NextResponse.json({ error: "This equipment is already borrowed" }, { status: 409 });
    }

    const [log] = await prisma.$transaction([
      prisma.borrowLog.create({
        data: {
          equipmentId,
          borrowerName,
          studentId,
          phone,
          takenAt: new Date(takenAt),
          status: "BORROWED",
        },
        include: { equipment: true },
      }),
      prisma.equipment.update({
        where: { id: equipmentId },
        data: { status: "BORROWED" },
      }),
    ]);

    return NextResponse.json(log, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to log borrow" }, { status: 500 });
  }
}
