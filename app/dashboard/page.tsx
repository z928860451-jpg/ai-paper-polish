"use client";
import { useState, useRef } from "react";
import Link from "next/link";

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
    if (!file.name.match(/\.(doc|docx)$/i)) { setError("只支持 .doc/.docx 格式"); return; }
    setFileName(file.name);
    setError("");
  }

  async function submit() {
    if (!code.trim()) { setError("请输入兑换码"); return; }
    if (!text.trim() && !fileRef.current?.files?.[0]) { setError("请粘贴文本或上传文件"); return; }
    setLoading(true); setError(""); setOutput(""); setReport(null); setOutputDocx(""); setReportDocx("");
    try {
      let resp: Response;
      if (fileRef.current?.files?.[0]) {
        const fd = new FormData();
        fd.append("code", code.trim());
        fd.append("file", fileRef.current.files[0]);
        if (text.trim()) fd.append("text", text.trim());
        resp = await fetch("/api/polish", { method: "POST", body: fd });
      } else {
        resp = await fetch("/api/polish", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.trim(), code: code.trim() }),
        });
      }
      const d = await resp.json();
      if (!resp.ok) { setError(d.error || "处理失败"); return; }
      setOutput(d.output); setReport(d.report);
      setOutputDocx(d.outputDocxBase64 || ""); setReportDocx(d.reportDocxBase64 || "");
    } catch (e: any) { setError(e.message || "网络错误"); }
    finally { setLoading(false); }
  }

  function downloadBase64(base64: string, filename: string) {
    const bin = atob(base64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    const blob = new Blob([arr], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      {/* 顶栏 */}
      <nav className="glass-card border-b border-[var(--border)] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md btn-primary flex items-center justify-center text-white text-xs font-bold">笔</div>
            <span className="font-bold">笔润 工作台</span>
          </Link>
          <Link href="/buy" className="text-xs text-[var(--accent-light)] hover:underline">获取兑换码</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* 兑换码输入栏 */}
        <div className="glass-card rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
              <label className="text-sm font-medium">兑换码</label>
            </div>
            <input
              value={code} onChange={(e) => setCode(e.target.value)}
              placeholder="BR-XXXX-XXXX-XXXX"
              className="flex-1 min-w-[240px] px-4 py-2.5 bg-[var(--bg)] rounded-lg border border-[var(--border)] text-sm font-mono outline-none focus:border-[var(--accent)] transition"
            />
            <span className="text-xs text-[var(--text-secondary)]">一码一用，提交即核销</span>
          </div>
        </div>

        {/* 主工作区 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 左：输入面板 */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]"></span>
                输入区
              </h2>
              <span className="text-xs text-[var(--text-secondary)] font-mono">{charCount} 字</span>
            </div>
            <textarea
              value={text} onChange={(e) => setText(e.target.value)}
              className="flex-1 min-h-[380px] p-5 bg-[var(--card)] rounded-xl border border-[var(--border)] text-sm leading-7 resize-none outline-none focus:border-[var(--accent)] transition placeholder:text-[var(--text-secondary)]/50"
              placeholder={"粘贴AI生成的论文段落...\n\n支持直接粘贴文本，或点击下方上传Word文件。\n单次最多处理5万字。"}
            />
            <div className="mt-3 flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm hover:border-[var(--accent)]/50 transition">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 10v2.667A1.334 1.334 0 0112.667 14H3.333A1.334 1.334 0 012 12.667V10M11.333 5.333L8 2M8 2L4.667 5.333M8 2v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                上传 .docx 文件
                <input ref={fileRef} type="file" accept=".doc,.docx" onChange={handleFile} className="hidden"/>
              </label>
              {fileName && <span className="text-xs text-green-400 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {fileName}
              </span>}
            </div>
            <button onClick={submit} disabled={loading} className="mt-4 btn-primary w-full py-3.5 rounded-xl text-white font-semibold text-sm">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  语义重构中，约30-60秒...
                </span>
              ) : "开始降AI味（消耗1个兑换码）"}
            </button>
            {error && <div className="mt-3 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          </div>

          {/* 右：输出面板 */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]"></span>
                改写结果
              </h2>
              {outputDocx && (
                <div className="flex gap-2">
                  <button onClick={() => downloadBase64(outputDocx, "降AI味改写稿.docx")}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-[var(--accent)]/20 text-[var(--accent-light)] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/30 transition">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M14 10v2.667A1.334 1.334 0 0112.667 14H3.333A1.334 1.334 0 012 12.667V10M4.667 6.667L8 10M8 10l3.333-3.333M8 10V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    改写稿
                  </button>
                  <button onClick={() => downloadBase64(reportDocx, "降AI味分析报告.docx")}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M14 10v2.667A1.334 1.334 0 0112.667 14H3.333A1.334 1.334 0 012 12.667V10M4.667 6.667L8 10M8 10l3.333-3.333M8 10V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    分析报告
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-[380px] p-5 bg-[var(--card)] rounded-xl border border-[var(--border)] text-sm leading-7 overflow-auto whitespace-pre-wrap">
              {output || <span className="text-[var(--text-secondary)]/60">改写结果将在此显示...<br/><br/>处理完成后可直接下载Word文件。</span>}
            </div>
          </div>
        </div>

        {/* 分析报告卡片 */}
        {report && (
          <div className="mt-8 glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span>
                降AI味分析报告
              </h2>
              {reportDocx && (
                <button onClick={() => downloadBase64(reportDocx, "降AI味分析报告.docx")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  下载完整报告
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="AI词减少" value={`${report.improvement.aiWordReduced}处`} sub={`-${report.improvement.aiWordReducedPct}%`} good />
              <StatCard label="句长方差" value={`+${report.improvement.sentenceVarianceGain}`} sub="节奏变化↑" good={report.improvement.sentenceVarianceGain > 0} />
              <StatCard label="文本相似度" value={`${report.improvement.similarityVs2gram}%`} sub="越低越好" />
              <StatCard label="查重预估降" value={`${report.improvement.estimatedDuplicationDrop}pp`} good />
            </div>
            <div className="text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-line p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              {report.conclusion}
            </div>
            {report.before.aiWordHits.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-[var(--text-secondary)]">原文AI词命中：</span>
                {report.before.aiWordHits.map((x) => (
                  <span key={x.word} className="tag-before text-xs px-2 py-0.5 rounded">{x.word} x{x.count}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, sub, good }: { label: string; value: string; sub?: string; good?: boolean }) {
  return (
    <div className="bg-[var(--bg)] rounded-xl p-4 border border-[var(--border)]">
      <div className="text-xs text-[var(--text-secondary)] mb-1">{label}</div>
      <div className={`text-2xl font-bold ${good ? "text-green-400" : "text-[var(--text)]"}`}>{value}</div>
      {sub && <div className="text-xs text-[var(--text-secondary)] mt-1">{sub}</div>}
    </div>
  );
}
