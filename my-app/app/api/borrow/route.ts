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
    const { equipmentIds, borrowerName, studentId, phone, takenAt } = body;

    // Validate payloads
    if (!Array.isArray(equipmentIds) || equipmentIds.length === 0 || !borrowerName || !studentId || !phone || !takenAt) {
      return NextResponse.json({ error: "All fields are required and must select at least one equipment" }, { status: 400 });
    }

    // Verify all selected equipment exists and is available
    const equipList = await prisma.equipment.findMany({
      where: { id: { in: equipmentIds } },
    });

    if (equipList.length !== equipmentIds.length) {
      return NextResponse.json({ error: "Some selected equipment was not found" }, { status: 404 });
    }

    const borrowedItems = equipList.filter((e: { status: string }) => e.status === "BORROWED");
    if (borrowedItems.length > 0) {
      return NextResponse.json({ error: "One or more selected items are already borrowed" }, { status: 409 });
    }

    // Prepare batch operations
    const logCreates = equipmentIds.map(id => prisma.borrowLog.create({
      data: {
        equipmentId: id,
        borrowerName,
        studentId,
        phone,
        takenAt: new Date(takenAt),
        status: "BORROWED",
      },
      include: { equipment: true }
    }));

    const equipUpdate = prisma.equipment.updateMany({
      where: { id: { in: equipmentIds } },
      data: { status: "BORROWED" },
    });

    // Execute everything in a single transaction
    const results = await prisma.$transaction([...logCreates, equipUpdate]);

    // Omit the final update result to return just the created logs
    const createdLogs = results.slice(0, equipmentIds.length);

    return NextResponse.json(createdLogs, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to log bulk borrow" }, { status: 500 });
  }
}
