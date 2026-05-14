// 核心润色接口（V2：免登录，兑换码直接消耗）
// POST /api/polish
// Body: { text, code } 或 FormData { file(docx), code }
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { polishText } from "@/lib/llm";
import { buildReport } from "@/lib/report";
import { buildOutputDocx, buildReportDocx } from "@/lib/docx-builder";

export const runtime = "nodejs";
export const maxDuration = 300;

// 从docx Buffer提取纯文本
async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = require("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value || "";
}

export async function POST(req: NextRequest) {
  let text = "";
  let code = "";

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    // 文件上传模式
    const formData = await req.formData();
    code = (formData.get("code") as string) || "";
    const file = formData.get("file") as File | null;
    const textField = formData.get("text") as string | null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      text = await extractTextFromDocx(Buffer.from(bytes));
    } else if (textField) {
      text = textField;
    }
  } else {
    // JSON模式
    const body = await req.json();
    text = body.text || "";
    code = body.code || "";
  }

  // 验证兑换码
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "请输入兑换码" }, { status: 400 });
  }
  const trimmedCode = code.trim().toUpperCase();

  // 验证文本
  const trimmedText = text.trim();
  if (!trimmedText || trimmedText.length < 50) {
    return NextResponse.json({ error: "文本太短，请至少提供50字" }, { status: 400 });
  }
  if (trimmedText.length > 50000) {
    return NextResponse.json({ error: "单次不超过5万字，请分段" }, { status: 400 });
  }

  // 原子核销兑换码（一码一用）
  const redeemResult = await prisma.$transaction(async (tx) => {
    const c = await tx.redeemCode.findUnique({ where: { code: trimmedCode } });
    if (!c) return { ok: false, error: "兑换码不存在" };
    if (c.status === "used") return { ok: false, error: "兑换码已被使用" };
    if (c.status === "disabled") return { ok: false, error: "兑换码已作废" };
    await tx.redeemCode.update({
      where: { code: trimmedCode },
      data: { status: "used", usedAt: new Date(), usedBy: "anonymous" },
    });
    return { ok: true };
  });

  if (!redeemResult.ok) {
    return NextResponse.json({ error: redeemResult.error }, { status: 400 });
  }

  // 创建任务记录（免登录，不关联用户）
  const job = await prisma.job.create({
    data: {
      inputText: trimmedText,
      charsInput: trimmedText.length,
      codeUsed: trimmedCode,
      status: "processing",
    },
  });

  try {
    const result = await polishText(trimmedText, false);
    const report = buildReport(trimmedText, result.output);

    // 生成docx文件（base64返回给前端直接下载）
    const outputDocxBuf = await buildOutputDocx(result.output);
    const reportDocxBuf = await buildReportDocx(report);

    await prisma.job.update({
      where: { id: job.id },
      data: {
        outputText: result.output,
        charsOutput: result.outputChars,
        reportJson: JSON.stringify(report),
        status: "done",
      },
    });

    return NextResponse.json({
      jobId: job.id,
      output: result.output,
      report,
      // base64编码的docx文件，前端直接下载不需要再请求
      outputDocxBase64: outputDocxBuf.toString("base64"),
      reportDocxBase64: reportDocxBuf.toString("base64"),
    });
  } catch (e: any) {
    // 失败回滚兑换码（让用户能重试）
    await prisma.redeemCode.update({
      where: { code: trimmedCode },
      data: { status: "active", usedAt: null, usedBy: null },
    });
    await prisma.job.update({ where: { id: job.id }, data: { status: "failed" } });
    return NextResponse.json({ error: e.message || "处理失败，兑换码已退回可重试" }, { status: 500 });
  }
}
