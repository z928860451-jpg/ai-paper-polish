// 用户兑换接口
import { NextRequest, NextResponse } from "next/server";
import { redeem } from "@/lib/redeem";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "兑换码不能为空" }, { status: 400 });
  const r = await redeem(code, user.userId);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
