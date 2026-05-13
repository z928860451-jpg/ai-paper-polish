// 管理员手工给用户加次数（用于半自动收款场景：你看到微信收款后，给指定邮箱加次数）
// POST /api/admin/grant  Header: x-admin-secret
// Body: { email, uses }
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-secret") !== ADMIN_SECRET) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const { email, uses, note } = await req.json();
  if (!email) return NextResponse.json({ error: "邮箱必填" }, { status: 400 });
  const n = parseInt(uses) || 1;
  if (n < 1 || n > 50) return NextResponse.json({ error: "数量1-50" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "用户不存在，让对方先注册" }, { status: 404 });

  // 同时建一条 paid 状态的订单记录便于对账
  const outTradeNo = `M${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { uses: { increment: n } },
    }),
    prisma.order.create({
      data: {
        userId: user.id,
        outTradeNo,
        amount: n * 990,
        usesAdded: n,
        status: "paid",
        payType: "manual",
        paidAt: new Date(),
      },
    }),
  ]);
  return NextResponse.json({ ok: true, email, addedUses: n, totalUses: user.uses + n, note });
}
