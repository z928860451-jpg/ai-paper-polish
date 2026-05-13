"use client";
import { useState } from "react";

export default function Pricing() {
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState("");
  const total = (count * 9.9).toFixed(1);

  async function buy(payType: "wechat" | "alipay") {
    setLoading(payType);
    try {
      const r = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payType, count }),
      });
      const d = await r.json();
      if (!r.ok) {
        if (r.status === 401) { location.href = "/login"; return; }
        alert(d.error || "下单失败");
        return;
      }
      location.href = d.payUrl;
    } finally {
      setLoading("");
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">购买使用次数</h1>
      <p className="text-[var(--muted)] mb-10">¥9.9/次，单次提交最多5万字，含改写稿+分析报告下载。次数不过期。</p>

      <div className="bg-[var(--card)] rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg">购买数量</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setCount(Math.max(1, count - 1))} className="w-9 h-9 rounded bg-[var(--bg)]">-</button>
            <span className="text-2xl font-bold w-12 text-center">{count}</span>
            <button onClick={() => setCount(Math.min(20, count + 1))} className="w-9 h-9 rounded bg-[var(--bg)]">+</button>
          </div>
        </div>
        <div className="flex items-baseline justify-between mb-8 pb-6 border-b border-white/10">
          <span className="text-[var(--muted)]">应付金额</span>
          <span className="text-4xl font-bold">¥{total}</span>
        </div>
        <button onClick={() => buy("wechat")} disabled={!!loading} className="w-full py-3 mb-3 rounded-lg bg-green-600 text-white font-medium disabled:opacity-50">
          {loading === "wechat" ? "跳转中..." : "微信支付（聚合通道）"}
        </button>
        <button onClick={() => buy("alipay")} disabled={!!loading} className="w-full py-3 mb-3 rounded-lg bg-blue-600 text-white font-medium disabled:opacity-50">
          {loading === "alipay" ? "跳转中..." : "支付宝（聚合通道）"}
        </button>
        <a href="/buy" className="block w-full py-3 rounded-lg bg-[var(--accent)] text-white font-medium text-center">
          扫码付款（半自动·5-30分钟到账）
        </a>
        <p className="text-xs text-[var(--muted)] mt-3 text-center">聚合通道未配置时，建议走"扫码付款"半自动通道</p>
      </div>

      <div className="mt-8 p-5 bg-[var(--card)]/50 rounded-lg text-sm text-[var(--muted)] leading-relaxed">
        <div className="font-semibold text-white mb-2">咸鱼下单的同学：</div>
        在咸鱼搜索店铺购买后会收到 <code className="bg-[var(--bg)] px-1.5 py-0.5 rounded text-[var(--accent)]">BR-XXXX-XXXX-XXXX</code> 格式兑换码，回到 <a href="/dashboard" className="text-[var(--accent)] underline">控制台</a> 顶部输入即可使用。
      </div>
    </main>
  );
}
