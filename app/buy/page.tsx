"use client";
import { useState } from "react";
import Link from "next/link";

export default function BuyPage() {
  const [tab, setTab] = useState<"wechat" | "xianyu">("wechat");

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      {/* 顶栏 */}
      <nav className="glass-card border-b border-[var(--border)] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md btn-primary flex items-center justify-center text-white text-xs font-bold">笔</div>
            <span className="font-bold">笔润 BiRun</span>
          </Link>
          <Link href="/dashboard" className="text-xs text-[var(--accent-light)]">已有码？去使用</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-6 pt-10">
        <h1 className="text-3xl font-bold mb-2">获取兑换码</h1>
        <p className="text-[var(--text-secondary)] mb-8">¥9.9/次 · 一码一用 · 单次最多处理5万字 · 交付改写稿+分析报告</p>

        {/* Tab切换 */}
        <div className="flex gap-2 mb-8 p-1 bg-[var(--card)] rounded-xl">
          <button
            onClick={() => setTab("wechat")}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition ${tab === "wechat" ? "btn-primary text-white" : "text-[var(--text-secondary)] hover:text-white"}`}
          >💬 微信付款</button>
          <button
            onClick={() => setTab("xianyu")}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition ${tab === "xianyu" ? "btn-primary text-white" : "text-[var(--text-secondary)] hover:text-white"}`}
          >🐟 咸鱼下单（自动发码）</button>
        </div>

        {/* 微信付款 */}
        {tab === "wechat" && (
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              微信付款流程
            </h2>

            <div className="space-y-6">
              {/* 步骤1 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 text-[var(--accent-light)] flex items-center justify-center text-sm font-bold shrink-0">1</div>
                <div>
                  <div className="font-medium mb-2">扫码付款 ¥9.9</div>
                  <div className="bg-white rounded-xl p-4 inline-block">
                    <img src="/pay/wechat-qr.jpg" alt="微信收款码" className="w-48 h-auto"/>
                  </div>
                </div>
              </div>

              {/* 步骤2 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 text-[var(--accent-light)] flex items-center justify-center text-sm font-bold shrink-0">2</div>
                <div>
                  <div className="font-medium mb-2">付款截图发给客服微信</div>
                  <div className="bg-[var(--bg)] rounded-xl p-4 border border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-lg">💬</div>
                      <div>
                        <div className="font-mono text-[var(--accent-light)] text-lg">biubiuji001</div>
                        <div className="text-xs text-[var(--text-secondary)]">添加客服微信，发送付款截图</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 步骤3 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 text-[var(--accent-light)] flex items-center justify-center text-sm font-bold shrink-0">3</div>
                <div>
                  <div className="font-medium mb-2">收到兑换码</div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    客服确认付款后，5-30分钟内通过微信发送兑换码（格式：BR-XXXX-XXXX-XXXX）。
                    <br/>夜间22:00-9:00的订单次日上午处理。
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-[var(--warning)]/10 border border-[var(--warning)]/20">
              <p className="text-sm text-[var(--warning)]">
                <strong>提示：</strong>付款时无需备注，直接扫码转账9.9元即可。截图发给客服微信 <strong>biubiuji001</strong> 后等待发码。
              </p>
            </div>
          </div>
        )}

        {/* 咸鱼下单 */}
        {tab === "xianyu" && (
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              咸鱼下单（自动发码）
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 text-[var(--accent-light)] flex items-center justify-center text-sm font-bold shrink-0">1</div>
                <div>
                  <div className="font-medium mb-2">搜索店铺</div>
                  <p className="text-sm text-[var(--text-secondary)]">打开闲鱼APP，搜索 <span className="text-white font-mono">「笔润降AI味」</span> 或 <span className="text-white font-mono">「论文降AIGC」</span></p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 text-[var(--accent-light)] flex items-center justify-center text-sm font-bold shrink-0">2</div>
                <div>
                  <div className="font-medium mb-2">下单付款</div>
                  <p className="text-sm text-[var(--text-secondary)]">选择「降AI味兑换码 · 1次」商品，按闲鱼正常流程付款</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm font-bold shrink-0">✓</div>
                <div>
                  <div className="font-medium mb-2 text-green-400">自动收到兑换码</div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    付款成功后，系统自动通过闲鱼消息发送兑换码。<br/>
                    格式：<span className="font-mono text-[var(--accent-light)]">BR-XXXX-XXXX-XXXX</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-300">
                <strong>推荐：</strong>咸鱼下单全程自动化，付款后秒收码，无需等待人工处理。且有闲鱼平台担保，不满意可退。
              </p>
            </div>
          </div>
        )}

        {/* 拿到码之后 */}
        <div className="mt-8 glass-card rounded-2xl p-6 text-center">
          <p className="text-sm text-[var(--text-secondary)] mb-3">拿到兑换码后</p>
          <Link href="/dashboard" className="btn-primary inline-block px-8 py-3 rounded-xl text-white font-semibold">
            去工作台使用 →
          </Link>
        </div>
      </div>
    </main>
  );
}
