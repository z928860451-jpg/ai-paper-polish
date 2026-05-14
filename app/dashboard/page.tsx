"use client";
import { useState, useRef } from "react";

interface Report {
  inputChars: number;
  outputChars: number;
  before: { aiWordTotal: number; aiWordHits: { word: string; count: number }[] };
  after: { aiWordTotal: number; aiWordHits: { word: string; count: number }[] };
  improvement: { aiWordReduced: number; aiWordReducedPct: number; sentenceVarianceGain: number; similarityVs2gram: number; estimatedDuplicationDrop: number };
  conclusion: string;
}

export default function Dashboard() {
  const [text, setText] = useState("");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [outputDocx, setOutputDocx] = useState("");
  const [reportDocx, setReportDocx] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const charCount = text.replace(/\s/g, "").length;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.match(/\.(doc|docx)$/i)) {
      setError("只支持 .doc/.docx 格式");
      return;
    }
    setFileName(file.name);
    setError("");
    // 读取文件后会在提交时用FormData发送
  }

  async function submit() {
    if (!code.trim()) { setError("请输入兑换码"); return; }
    if (!text.trim() && !fileRef.current?.files?.[0]) { setError("请粘贴文本或上传文件"); return; }

    setLoading(true);
    setError("");
    setOutput("");
    setReport(null);
    setOutputDocx("");
    setReportDocx("");

    try {
      let resp: Response;

      if (fileRef.current?.files?.[0]) {
        // 文件上传模式
        const fd = new FormData();
        fd.append("code", code.trim());
        fd.append("file", fileRef.current.files[0]);
        if (text.trim()) fd.append("text", text.trim()); // 文本也带上作为备用
        resp = await fetch("/api/polish", { method: "POST", body: fd });
      } else {
        // 纯文本模式
        resp = await fetch("/api/polish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.trim(), code: code.trim() }),
        });
      }

      const d = await resp.json();
      if (!resp.ok) {
        setError(d.error || "处理失败");
        return;
      }
      setOutput(d.output);
      setReport(d.report);
      setOutputDocx(d.outputDocxBase64 || "");
      setReportDocx(d.reportDocxBase64 || "");
    } catch (e: any) {
      setError(e.message || "网络错误");
    } finally {
      setLoading(false);
    }
  }

  function downloadBase64(base64: string, filename: string) {
    const bin = atob(base64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    const blob = new Blob([arr], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen p-6 md:p-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">笔润 · 降AI味工作台</h1>
        <a href="/buy" className="text-sm text-[var(--accent)]">没有兑换码？去购买</a>
      </header>

      {/* 兑换码输入 */}
      <div className="bg-[var(--card)] rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm font-medium">兑换码</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="BR-XXXX-XXXX-XXXX"
            className="flex-1 min-w-[260px] px-3 py-2 bg-[var(--bg)] rounded border border-white/10 text-sm font-mono outline-none focus:border-[var(--accent)]"
          />
          <span className="text-xs text-[var(--muted)]">一码一用，提交后自动核销</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 左侧：输入 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-[var(--muted)]">输入论文文本（粘贴或上传）</label>
            <span className="text-xs text-[var(--muted)]">{charCount}字</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-[360px] p-4 bg-[var(--card)] rounded-lg border border-white/10 text-sm leading-relaxed resize-none outline-none focus:border-[var(--accent)]"
            placeholder="粘贴AI生成的论文段落...&#10;&#10;或者点下方按钮上传Word文件"
          />

          {/* 上传按钮 */}
          <div className="mt-3 flex items-center gap-3">
            <label className="cursor-pointer px-4 py-2 rounded bg-[var(--card)] border border-white/10 text-sm hover:border-[var(--accent)] transition">
              📎 上传 .doc/.docx 文件
              <input
                ref={fileRef}
                type="file"
                accept=".doc,.docx"
                onChange={handleFile}
                className="hidden"
              />
            </label>
            {fileName && <span className="text-xs text-green-400">已选：{fileName}</span>}
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="mt-4 w-full py-3 rounded-lg bg-[var(--accent)] text-white font-medium disabled:opacity-50"
          >
            {loading ? "AI改写中... 约30-60秒" : "开始降AI味（消耗1个兑换码）"}
          </button>
          {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
        </div>

        {/* 右侧：输出 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-[var(--muted)]">改写结果</label>
            {outputDocx && (
              <div className="flex gap-2">
                <button
                  onClick={() => downloadBase64(outputDocx, "降AI味改写稿.docx")}
                  className="text-xs px-3 py-1 rounded bg-[var(--accent)] text-white"
                >📥 下载改写稿</button>
                <button
                  onClick={() => downloadBase64(reportDocx, "降AI味分析报告.docx")}
                  className="text-xs px-3 py-1 rounded bg-purple-600 text-white"
                >📊 下载报告</button>
              </div>
            )}
          </div>
          <div className="w-full h-[360px] p-4 bg-[var(--card)] rounded-lg border border-white/10 text-sm leading-relaxed overflow-auto whitespace-pre-wrap">
            {output || <span className="text-[var(--muted)]">改写结果会显示在这里，同时生成Word文件供下载</span>}
          </div>
        </div>
      </div>

      {/* 报告卡片 */}
      {report && (
        <div className="mt-8 bg-[var(--card)] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">降AI味分析报告</h2>
            {reportDocx && (
              <button
                onClick={() => downloadBase64(reportDocx, "降AI味分析报告.docx")}
                className="text-xs px-3 py-1 rounded bg-purple-600 text-white"
              >📊 下载完整报告</button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <Stat label="AI词减少" value={`${report.improvement.aiWordReduced}处`} sub={`-${report.improvement.aiWordReducedPct}%`} good />
            <Stat label="句长方差提升" value={`+${report.improvement.sentenceVarianceGain}`} sub="节奏更自然" good={report.improvement.sentenceVarianceGain > 0} />
            <Stat label="2-gram相似度" value={`${report.improvement.similarityVs2gram}%`} sub="越低越好" />
            <Stat label="预估查重下降" value={`${report.improvement.estimatedDuplicationDrop}个百分点`} good />
          </div>
          <div className="text-sm leading-relaxed text-[var(--muted)] whitespace-pre-line">{report.conclusion}</div>
          {report.before.aiWordHits.length > 0 && (
            <div className="mt-4 text-xs text-[var(--muted)]">
              <span className="font-semibold">原文命中AI词：</span>
              {report.before.aiWordHits.map((x) => (
                <span key={x.word} className="inline-block bg-red-900/40 text-red-200 px-2 py-0.5 rounded mr-2 mb-1">{x.word}×{x.count}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function Stat({ label, value, sub, good }: { label: string; value: string; sub?: string; good?: boolean }) {
  return (
    <div className="bg-[var(--bg)] rounded p-3">
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${good ? "text-green-400" : ""}`}>{value}</div>
      {sub && <div className="text-xs text-[var(--muted)] mt-1">{sub}</div>}
    </div>
  );
}
