// 虎皮椒异步回调：必须返回纯文本"success"
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyXunhuNotify } from "@/lib/xunhu-pay";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const params: Record<string, any> = {};
  formData.forEach((v, k) => (params[k] = v.toString()));

  if (!verifyXunhuNotify(params)) {
    return new Response("FAIL: signature", { status: 400 });
  }

  const outTradeNo = params.trade_order_id;
  const status = params.status;
  const order = await prisma.order.findUnique({ where: { outTradeNo } });
  if (!order) return new Response("FAIL: order not found", { status: 404 });
  if (order.status === "paid") return new Response("success");

  if (status === "OD") {
    await prisma.$transaction([
      prisma.order.update({
        where: { outTradeNo },
        data: { status: "paid", paidAt: new Date() },
      }),
      prisma.user.update({
        where: { id: order.userId },
        data: { uses: { increment: order.usesAdded } },
      }),
    ]);
  }
  return new Response("success");
}
