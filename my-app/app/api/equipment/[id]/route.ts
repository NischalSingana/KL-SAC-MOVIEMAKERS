import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, model, serialNumber, condition, notes, status } = body;

    const existing = await prisma.equipment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
    }

    // If serialNumber is being changed, check for uniqueness
    if (serialNumber && serialNumber !== existing.serialNumber) {
      const conflict = await prisma.equipment.findUnique({ where: { serialNumber } });
      if (conflict) {
        return NextResponse.json({ error: "Serial number already in use" }, { status: 409 });
      }
    }

    const updated = await prisma.equipment.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(model && { model }),
        ...(serialNumber && { serialNumber }),
        ...(condition && { condition }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update equipment" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.equipment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete equipment" }, { status: 500 });
  }
}
