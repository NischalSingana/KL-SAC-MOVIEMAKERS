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
    const { items, borrowerName, studentId, phone, takenAt } = body;
    // items: { id: string, quantity: number }[]

    if (!Array.isArray(items) || items.length === 0 || !borrowerName || !studentId || !phone || !takenAt) {
      return NextResponse.json({ error: "All fields are required and must select at least one equipment" }, { status: 400 });
    }

    const equipmentIds = items.map(i => i.id);

    // Verify all selected equipment exists and has available stock
    const equipList = await prisma.equipment.findMany({
      where: { id: { in: equipmentIds } },
      include: {
        borrowLogs: {
          where: { returnedAt: null }
        }
      }
    });

    if (equipList.length !== equipmentIds.length) {
      return NextResponse.json({ error: "Some selected equipment was not found" }, { status: 404 });
    }

    // Check availability for each requested item quantity
    for (const item of items) {
      const eq = equipList.find(e => e.id === item.id);
      if (!eq) continue;
      
      const available = eq.quantity - eq.borrowLogs.length;
      if (item.quantity > available) {
        return NextResponse.json({ error: `Not enough stock for: ${eq.name}. Requested ${item.quantity}, but only ${available} available.` }, { status: 409 });
      }
    }

    // Prepare operations
    const operations = [];

    for (const item of items) {
      const eq = equipList.find(e => e.id === item.id);
      if (!eq) continue;

      // Create a borrow log for each unit being borrowed
      for (let q = 0; q < item.quantity; q++) {
        operations.push(prisma.borrowLog.create({
          data: {
            equipmentId: item.id,
            borrowerName,
            studentId,
            phone,
            takenAt: new Date(takenAt),
            status: "BORROWED",
          },
          include: { equipment: true }
        }));
      }

      // If this borrow transaction empties the stock, update equipment status
      if (eq.borrowLogs.length + item.quantity >= eq.quantity) {
        operations.push(prisma.equipment.update({
          where: { id: item.id },
          data: { status: "BORROWED" }
        }));
      }
    }

    // Execute everything in a transaction
    const results = await prisma.$transaction(operations);

    // Filter out the equipment status updates from results to return only logs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createdLogs = results.filter(r => (r as any).equipmentId !== undefined);

    return NextResponse.json(createdLogs, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to log bulk borrow" }, { status: 500 });
  }
}
