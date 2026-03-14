import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, name, password, newPassword, borrowAlerts, projectAlerts } = await req.json();

    if (action === "updateProfile") {
      if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
      const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      });
      return NextResponse.json({ success: true, user: { name: updated.name } });
    }

    if (action === "updatePassword") {
      if (!password || !newPassword) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user || !user.password) return NextResponse.json({ error: "Invalid user" }, { status: 400 });

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });

      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashed },
      });
      
      return NextResponse.json({ success: true, message: "Password updated successfully" });
    }
    
    if (action === "updateNotifications") {
      const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          ...(borrowAlerts !== undefined && { borrowAlerts }),
          ...(projectAlerts !== undefined && { projectAlerts }),
        },
      });
      return NextResponse.json({
        success: true,
        notifications: {
          borrowAlerts: updated.borrowAlerts,
          projectAlerts: updated.projectAlerts
        }
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Settings API Error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
