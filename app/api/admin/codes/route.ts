// 管理员后台：批量生成兑换码（用于咸鱼发货）
// 调用方式：POST /api/admin/codes  Header: x-admin-secret: xxx
import { NextRequest, NextResponse } from "next/server";
import { batchGenerate } from "@/lib/redeem";
import { prisma } from "@/lib/db";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "";

function checkAdmin(req: NextRequest): boolean {
  const s = req.headers.get("x-admin-secret");
  return !!ADMIN_SECRET && s === ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { count, note } = await req.json();
  const n = parseInt(count) || 1;
  if (n < 1 || n > 200) return NextResponse.json({ error: "数量范围1-200" }, { status: 400 });
  const codes = await batchGenerate(n, "xianyu", note);
  return NextResponse.json({ codes, count: codes.length });
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const list = await prisma.redeemCode.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ list });
}
