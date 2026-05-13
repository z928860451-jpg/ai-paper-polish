import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createXunhuPay } from "@/lib/xunhu-pay";
import { PRICE_PER_USE_FEN } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const { payType, count } = await req.json();
  if (!["wechat", "alipay"].includes(payType)) {
    return NextResponse.json({ error: "支付方式错误" }, { status: 400 });
  }
  const n = Math.min(Math.max(parseInt(count) || 1, 1), 20); // 单次最多购20次
  const totalFen = PRICE_PER_USE_FEN * n;
  const outTradeNo = `O${Date.now()}${Math.random().toString(36).slice(2, 6)}`;

  await prisma.order.create({
    data: {
      userId: user.userId,
      outTradeNo,
      amount: totalFen,
      usesAdded: n,
      payType,
      status: "pending",
    },
  });

  const pay = await createXunhuPay({
    outTradeNo,
    totalFen,
    title: `笔润降AI味·${n}次`,
    payType: payType as "wechat" | "alipay",
  });

  return NextResponse.json({ payUrl: pay.url, qrcode: pay.url_qrcode, outTradeNo });
}
