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
          take: 1,
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
    const { name, model, serialNumber, condition, notes } = body;

    if (!name || !model || !serialNumber) {
      return NextResponse.json({ error: "name, model, and serialNumber are required" }, { status: 400 });
    }

    const existing = await prisma.equipment.findUnique({ where: { serialNumber } });
    if (existing) {
      return NextResponse.json({ error: "An equipment with this serial number already exists" }, { status: 409 });
    }

    const item = await prisma.equipment.create({
      data: {
        name,
        model,
        serialNumber,
        condition: condition || "GOOD",
        notes,
        status: "AVAILABLE",
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to add equipment" }, { status: 500 });
  }
}
