import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { polishText } from "@/lib/llm";
import { getCurrentUser } from "@/lib/auth";
import { buildReport } from "@/lib/report";

export const runtime = "nodejs";
// Render.com 是完整Node服务器环境，不像Serverless有超时限制
// 长文5万字约需3-5分钟（V4-flash 并发3段）
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const { text, usePro } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "文本不能为空" }, { status: 400 });
  }
  const trimmed = text.trim();
  if (trimmed.length < 50) {
    return NextResponse.json({ error: "文本太短，请至少粘贴50字" }, { status: 400 });
  }
  if (trimmed.length > 50000) {
    return NextResponse.json({ error: "单次处理不超过5万字，请分段提交" }, { status: 400 });
  }

  // 单次原子扣减 + 失败回滚语义：
  // 直接执行 updateMany(where uses>=1, decrement 1)，count==0 即"次数不足"。
  // 不再前置 findUnique 判断，避免并发场景下"先报够用、再扣失败"的体验割裂。
  const decResult = await prisma.user.updateMany({
    where: { id: user.userId, uses: { gte: 1 } },
    data: { uses: { decrement: 1 } },
  });
  if (decResult.count === 0) {
    // 区分两种 0 命中：用户不存在 vs 次数已用完
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!dbUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "使用次数已用完，请购买或输入兑换码" },
      { status: 402 }
    );
  }

  // 创建任务记录
  const job = await prisma.job.create({
    data: {
      userId: user.userId,
      inputText: trimmed,
      charsInput: trimmed.length,
      status: "processing",
    },
  });

  try {
    const result = await polishText(trimmed, Boolean(usePro));
    const report = buildReport(trimmed, result.output);
    await prisma.job.update({
      where: { id: job.id },
      data: {
        outputText: result.output,
        charsOutput: result.outputChars,
        reportJson: JSON.stringify(report),
        status: "done",
      },
    });
    // 仅在最终返回阶段查一次最新剩余次数
    const refreshed = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { uses: true },
    });
    return NextResponse.json({
      jobId: job.id,
      output: result.output,
      report,
      remainingUses: refreshed?.uses ?? 0,
    });
  } catch (e: any) {
    // 失败回滚次数（与上面 decrement 配对，单次扣减+失败回滚的事务语义）
    await prisma.user.update({
      where: { id: user.userId },
      data: { uses: { increment: 1 } },
    });
    await prisma.job.update({ where: { id: job.id }, data: { status: "failed" } });
    return NextResponse.json(
      { error: e.message || "处理失败，次数已退回" },
      { status: 500 }
    );
  }
}
