import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const u = getCurrentUser();
  if (!u) return NextResponse.json({ user: null });
  const dbUser = await prisma.user.findUnique({
    where: { id: u.userId },
    select: { email: true, uses: true },
  });
  return NextResponse.json({ user: dbUser });
}
