// 降AI味分析报告生成器
// 输入原文+改后文本，输出量化指标 + 命中AI词清单 + 改写示例对比

const AI_BLACKLIST = [
  "深入探讨", "深入分析", "值得注意的是", "需要指出的是", "在快速发展的背景下",
  "扮演着至关重要的角色", "扮演着重要的角色", "起到了关键作用", "为...奠定了基础",
  "综上所述", "总的来说", "总而言之", "首先", "其次", "再次", "最后",
  "不仅...而且", "不仅仅是", "不容忽视", "至关重要", "举足轻重",
  "全方位", "多维度", "多层次", "多角度", "全面而深入", "层层递进",
  "在某种程度上", "在一定程度上", "从某种意义上", "在很大程度上",
  "delve into", "showcases", "highlights", "leveraging", "multifaceted",
  "tapestry", "underscores", "paves the way", "play a pivotal role",
  "it is worth noting", "in the rapidly evolving",
];

const FORBIDDEN_PUNCT = ["——", "——"];

function countMatches(text: string, patterns: string[]): { word: string; count: number }[] {
  const result: { word: string; count: number }[] = [];
  for (const p of patterns) {
    const re = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const m = text.match(re);
    if (m && m.length > 0) result.push({ word: p, count: m.length });
  }
  return result.sort((a, b) => b.count - a.count);
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[。！？.!?])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// 句长方差：方差越大说明句长杂揉越好
function sentenceLengthStats(text: string) {
  const sents = splitSentences(text);
  if (sents.length === 0) return { count: 0, avg: 0, variance: 0, max: 0, min: 0 };
  const lens = sents.map((s) => s.length);
  const avg = lens.reduce((a, b) => a + b, 0) / lens.length;
  const variance = lens.reduce((s, l) => s + (l - avg) ** 2, 0) / lens.length;
  return {
    count: sents.length,
    avg: Math.round(avg * 10) / 10,
    variance: Math.round(variance * 10) / 10,
    max: Math.max(...lens),
    min: Math.min(...lens),
  };
}

// 字符级相似度（粗略估计查重率变化）：相同2-gram的占比
function ngramSimilarity(a: string, b: string, n = 2): number {
  const norm = (s: string) => s.replace(/[\s\p{P}]/gu, "");
  const A = norm(a);
  const B = norm(b);
  if (A.length < n || B.length < n) return 0;
  const setA = new Set<string>();
  for (let i = 0; i <= A.length - n; i++) setA.add(A.slice(i, i + n));
  let overlap = 0;
  let total = 0;
  for (let i = 0; i <= B.length - n; i++) {
    const g = B.slice(i, i + n);
    total++;
    if (setA.has(g)) overlap++;
  }
  return total > 0 ? overlap / total : 0;
}

export interface PolishReport {
  inputChars: number;
  outputChars: number;
  before: {
    aiWordHits: { word: string; count: number }[];
    aiWordTotal: number;
    sentenceStats: ReturnType<typeof sentenceLengthStats>;
    emDashCount: number;
  };
  after: {
    aiWordHits: { word: string; count: number }[];
    aiWordTotal: number;
    sentenceStats: ReturnType<typeof sentenceLengthStats>;
    emDashCount: number;
  };
  improvement: {
    aiWordReduced: number;
    aiWordReducedPct: number;
    sentenceVarianceGain: number;
    similarityVs2gram: number;
    estimatedDuplicationDrop: number;
  };
  conclusion: string;
}

export function buildReport(input: string, output: string): PolishReport {
  const beforeHits = countMatches(input, AI_BLACKLIST);
  const afterHits = countMatches(output, AI_BLACKLIST);
  const beforeTotal = beforeHits.reduce((s, x) => s + x.count, 0);
  const afterTotal = afterHits.reduce((s, x) => s + x.count, 0);
  const beforeStats = sentenceLengthStats(input);
  const afterStats = sentenceLengthStats(output);
  const beforeDash = (input.match(/——/g) || []).length;
  const afterDash = (output.match(/——/g) || []).length;
  const sim = ngramSimilarity(input, output, 2);
  const reducedPct = beforeTotal > 0 ? Math.round((1 - afterTotal / beforeTotal) * 1000) / 10 : 0;
  const varianceGain = Math.round((afterStats.variance - beforeStats.variance) * 10) / 10;
  const dupDrop = Math.round((1 - sim) * 100);

  // 综合结论
  const lines: string[] = [];
  if (beforeTotal > 0) {
    lines.push(`原文检出AI高频词${beforeTotal}处，改写后剩余${afterTotal}处，下降${reducedPct}%。`);
  } else {
    lines.push(`原文未检出明显AI高频词。`);
  }
  if (varianceGain > 0) {
    lines.push(`句长方差由${beforeStats.variance}提升至${afterStats.variance}（+${varianceGain}），节奏更接近人类写作。`);
  }
  lines.push(`与原文的2-gram相似度为${(sim * 100).toFixed(1)}%，预估查重率相对原文下降${dupDrop}个百分点。`);
  lines.push(`建议：将本结果再次粘入第三方查重工具（PaperPass/PaperYY）做最终验证。`);

  return {
    inputChars: input.length,
    outputChars: output.length,
    before: {
      aiWordHits: beforeHits,
      aiWordTotal: beforeTotal,
      sentenceStats: beforeStats,
      emDashCount: beforeDash,
    },
    after: {
      aiWordHits: afterHits,
      aiWordTotal: afterTotal,
      sentenceStats: afterStats,
      emDashCount: afterDash,
    },
    improvement: {
      aiWordReduced: beforeTotal - afterTotal,
      aiWordReducedPct: reducedPct,
      sentenceVarianceGain: varianceGain,
      similarityVs2gram: Math.round(sim * 1000) / 10,
      estimatedDuplicationDrop: dupDrop,
    },
    conclusion: lines.join("\n"),
  };
}
