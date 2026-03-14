import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const equipment = await prisma.equipment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        borrowLogs: {
          where: { status: "BORROWED", returnedAt: null },
          orderBy: { takenAt: "desc" },
          select: { borrowerName: true, studentId: true, phone: true, takenAt: true },
        },
      },
    });
    return NextResponse.json(equipment);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch equipment" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, model, serialNumber, notes, quantity } = body;

    if (!name || !model) {
      return NextResponse.json({ error: "name and model are required" }, { status: 400 });
    }

    const item = await prisma.equipment.create({
      data: {
        name,
        model,
        serialNumber: serialNumber || null,
        notes,
        quantity: parseInt(quantity) || 1,
        status: "AVAILABLE",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to add equipment" }, { status: 500 });
  }
}
