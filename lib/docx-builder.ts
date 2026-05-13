// 用 docx 库生成 Word 文档：改写后的论文 + 分析报告
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
import type { PolishReport } from "./report";

function p(text: string, opts: { bold?: boolean; size?: number; align?: any } = {}) {
  return new Paragraph({
    alignment: opts.align,
    children: [new TextRun({ text, bold: opts.bold, size: opts.size, font: "宋体" })],
  });
}

function h(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]) {
  return new Paragraph({
    heading: level,
    children: [new TextRun({ text, bold: true, font: "黑体" })],
  });
}

// 改写后正文：直接打成段落
export async function buildOutputDocx(output: string): Promise<Buffer> {
  const paragraphs = output.split(/\n\s*\n/).filter((s) => s.trim().length > 0);
  const doc = new Document({
    creator: "笔润 BiRun",
    title: "降AI味改写稿",
    sections: [
      {
        properties: {},
        children: [
          h("降AI味改写稿", HeadingLevel.HEADING_1),
          p(""),
          ...paragraphs.flatMap((para) => [
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              children: [new TextRun({ text: para, size: 24, font: "宋体" })],
              spacing: { line: 360, after: 120 },
              indent: { firstLine: 480 }, // 首行缩进2字符
            }),
          ]),
        ],
      },
    ],
  });
  return await Packer.toBuffer(doc);
}

function makeTable(rows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      (r, i) =>
        new TableRow({
          children: r.map(
            (cell) =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: cell,
                        bold: i === 0,
                        size: 22,
                        font: "宋体",
                      }),
                    ],
                  }),
                ],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
                  left: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
                  right: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
                },
              })
          ),
        })
    ),
  });
}

export async function buildReportDocx(report: PolishReport): Promise<Buffer> {
  const aiWordsBefore = report.before.aiWordHits.map((x) => `${x.word}(${x.count})`).join("、") || "未检出";
  const aiWordsAfter = report.after.aiWordHits.map((x) => `${x.word}(${x.count})`).join("、") || "已清除";

  const children: any[] = [
    h("降AI味分析报告", HeadingLevel.HEADING_1),
    p(`生成时间：${new Date().toLocaleString("zh-CN")}`, { size: 20 }),
    p(""),
    h("一、文本规模", HeadingLevel.HEADING_2),
    makeTable([
      ["指标", "原文", "改写后"],
      ["字符数", String(report.inputChars), String(report.outputChars)],
      ["句子数", String(report.before.sentenceStats.count), String(report.after.sentenceStats.count)],
      ["平均句长", String(report.before.sentenceStats.avg), String(report.after.sentenceStats.avg)],
      ["句长方差（越大越自然）", String(report.before.sentenceStats.variance), String(report.after.sentenceStats.variance)],
    ]),
    p(""),
    h("二、AI高频词检测", HeadingLevel.HEADING_2),
    p("黑名单覆盖30+常见AI痕迹词，例如『深入探讨』『扮演重要角色』『综上所述』等。", { size: 22 }),
    p(""),
    makeTable([
      ["维度", "原文", "改写后"],
      ["命中词种类", String(report.before.aiWordHits.length), String(report.after.aiWordHits.length)],
      ["命中总次数", String(report.before.aiWordTotal), String(report.after.aiWordTotal)],
      ["破折号使用", String(report.before.emDashCount), String(report.after.emDashCount)],
    ]),
    p(""),
    p(`原文命中词清单：${aiWordsBefore}`, { size: 22 }),
    p(`改写后剩余：${aiWordsAfter}`, { size: 22 }),
    p(""),
    h("三、降AI味效果量化", HeadingLevel.HEADING_2),
    makeTable([
      ["指标", "数值"],
      ["AI词减少", `${report.improvement.aiWordReduced} 处（${report.improvement.aiWordReducedPct}%）`],
      ["句长方差提升", String(report.improvement.sentenceVarianceGain)],
      ["与原文2-gram相似度", `${report.improvement.similarityVs2gram}%`],
      ["预估查重率下降", `${report.improvement.estimatedDuplicationDrop} 个百分点`],
    ]),
    p(""),
    h("四、综合结论", HeadingLevel.HEADING_2),
    ...report.conclusion.split("\n").map((line) => p(line, { size: 22 })),
    p(""),
    p("—— 笔润 BiRun · 学术降AI味服务 ——", { size: 20, align: AlignmentType.CENTER }),
    p("仅供学术润色辅助，请用户自行确保学术诚信。", { size: 18, align: AlignmentType.CENTER }),
  ];

  const doc = new Document({
    creator: "笔润 BiRun",
    title: "降AI味分析报告",
    sections: [{ properties: {}, children }],
  });
  return await Packer.toBuffer(doc);
}
