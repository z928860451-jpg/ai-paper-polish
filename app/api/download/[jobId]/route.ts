// 下载docx：/api/download/[jobId]?type=output  或  ?type=report
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { buildOutputDocx, buildReportDocx } from "@/lib/docx-builder";

export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: { jobId: string } }) {
  const user = getCurrentUser();
  if (!user) return new Response("未登录", { status: 401 });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "output";

  const job = await prisma.job.findUnique({ where: { id: ctx.params.jobId } });
  if (!job || job.userId !== user.userId) return new Response("任务不存在", { status: 404 });
  if (job.status !== "done") return new Response("任务未完成", { status: 400 });

  let buffer: Buffer;
  let filename: string;
  if (type === "report") {
    if (!job.reportJson) return new Response("报告不存在", { status: 404 });
    buffer = await buildReportDocx(JSON.parse(job.reportJson));
    filename = `降AI味报告_${job.id.slice(-6)}.docx`;
  } else {
    if (!job.outputText) return new Response("改写结果不存在", { status: 404 });
    buffer = await buildOutputDocx(job.outputText);
    filename = `改写稿_${job.id.slice(-6)}.docx`;
  }

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
