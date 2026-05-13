"use client";
import { useEffect, useState } from "react";

interface UserInfo { email: string; uses: number; }

interface Report {
  inputChars: number;
  outputChars: number;
  before: { aiWordTotal: number; aiWordHits: { word: string; count: number }[]; sentenceStats: any; emDashCount: number };
  after: { aiWordTotal: number; aiWordHits: { word: string; count: number }[]; sentenceStats: any; emDashCount: number };
  improvement: { aiWordReduced: number; aiWordReducedPct: number; sentenceVarianceGain: number; similarityVs2gram: number; estimatedDuplicationDrop: number };
  conclusion: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [jobId, setJobId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [redeemMsg, setRedeemMsg] = useState("");

  const charCount = text.replace(/\s/g, "").length;

  function refreshUser() {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
  }
  useEffect(refreshUser, []);

  async function submit() {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setOutput("");
    setReport(null);
    try {
      const r = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const d = await r.json();
      if (!r.ok) {
        if (r.status === 401) { location.href = "/login"; return; }
        setError(d.error || "处理失败");
        return;
      }
      setOutput(d.output);
      setReport(d.report);
      setJobId(d.jobId);
      refreshUser();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function redeem() {
    if (!code.trim()) return;
    setRedeemMsg("");
    const r = await fetch("/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const d = await r.json();
    if (!r.ok) { setRedeemMsg(d.error || "兑换失败"); return; }
    setRedeemMsg("✓ 兑换成功，已增加1次使用机会");
    setCode("");
    refreshUser();
  }

  return (
    <main className="min-h-screen p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">笔润 · 控制台</h1>
        {user ? (
          <div className="text-sm text-[var(--muted)] flex items-center gap-3">
            <span>{user.email}</span>
            <span>剩余次数 <span className="text-white font-semibold">{user.uses}</span></span>
            <a href="/pricing" className="px-3 py-1.5 rounded bg-[var(--accent)] text-white">购买</a>
          </div>
        ) : (
          <a href="/login" className="text-[var(--accent)]">登录</a>
        )}
      </header>

      {/* 兑换码入口 */}
      <div className="bg-[var(--card)] rounded-lg p-4 mb-6 flex items-center gap-3">
        <span className="text-sm text-[var(--muted)]">咸鱼下单的用户：输入兑换码</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="BR-XXXX-XXXX-XXXX"
          className="flex-1 max-w-xs px-3 py-1.5 bg-[var(--bg)] rounded border border-white/10 text-sm outline-none focus:border-[var(--accent)]"
        />
        <button onClick={redeem} className="px-4 py-1.5 rounded bg-green-600 text-white text-sm">兑换</button>
        {redeemMsg && <span className="text-xs text-green-400">{redeemMsg}</span>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-[var(--muted)]">原文（粘贴待润色文本，单次≤2000字）</label>
            <span className="text-xs text-[var(--muted)]">{charCount}字</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-[440px] p-4 bg-[var(--card)] rounded-lg border border-white/10 text-sm leading-relaxed resize-none outline-none focus:border-[var(--accent)]"
            placeholder="把AI生成的论文段落粘到这里。单次扣1次使用机会，无关字数。"
          />
          <button
            onClick={submit}
            disabled={loading || !text.trim() || (user?.uses ?? 0) < 1}
            className="mt-4 w-full py-3 rounded-lg bg-[var(--accent)] text-white font-medium disabled:opacity-50"
          >
            {loading ? "改写中... 1-3分钟" : (user?.uses ?? 0) < 1 ? "次数不足，请购买或兑换" : "开始降AI味（消耗1次）"}
          </button>
          {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-[var(--muted)]">改写后</label>
            {jobId && (
              <div className="flex gap-2">
                <a href={`/api/download/${jobId}?type=output`} className="text-xs px-2 py-1 rounded bg-[var(--accent)] text-white">下载Word</a>
                <a href={`/api/download/${jobId}?type=report`} className="text-xs px-2 py-1 rounded bg-purple-600 text-white">下载报告</a>
              </div>
            )}
          </div>
          <div className="w-full h-[440px] p-4 bg-[var(--card)] rounded-lg border border-white/10 text-sm leading-relaxed overflow-auto whitespace-pre-wrap">
            {output || <span className="text-[var(--muted)]">改写结果会显示在这里</span>}
          </div>
        </div>
      </div>

      {/* 报告卡片 */}
      {report && (
        <div className="mt-8 bg-[var(--card)] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">降AI味分析报告</h2>
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
