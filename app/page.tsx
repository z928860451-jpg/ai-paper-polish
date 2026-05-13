import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="text-xl font-bold tracking-wide">笔润 BiRun</div>
        <div className="flex gap-6 text-sm text-[var(--muted)]">
          <Link href="/pricing" className="hover:text-white">定价</Link>
          <Link href="/dashboard" className="hover:text-white">控制台</Link>
          <Link href="/login" className="px-4 py-1.5 rounded-md bg-[var(--accent)] text-white">登录</Link>
        </div>
      </nav>

      <section className="px-8 pt-20 pb-12 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold leading-tight mb-6">
          让AI写出的论文 <span className="text-[var(--accent)]">不像AI写的</span>
        </h1>
        <p className="text-lg text-[var(--muted)] mb-3">
          内置学术降AIGC策略，单次提交≤2000字，自动生成Word文档与降AI味分析报告。
        </p>
        <p className="text-3xl font-bold my-8">
          ¥9.9 <span className="text-base font-normal text-[var(--muted)]">/次 · 按次购买，用多少买多少</span>
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/dashboard" className="px-6 py-3 rounded-md bg-[var(--accent)] text-white font-medium">立即开始</Link>
          <Link href="/pricing" className="px-6 py-3 rounded-md border border-white/15">购买次数</Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 px-8 max-w-5xl mx-auto pb-12">
        {[
          { t: "降AI特征", d: "禁用30+AI高频词（深入探讨/扮演重要角色/综上所述等），破除排比与机械连接词，句长杂揉。" },
          { t: "降查重率", d: "句式重组、主被动转换、同义改写、数据表达变形，专业术语保留语义不动。" },
          { t: "双文件交付", d: "改写后的Word文档 + 量化分析报告（AI词命中、句长方差、相似度对比）。" },
        ].map((it) => (
          <div key={it.t} className="bg-[var(--card)] rounded-xl p-6">
            <div className="text-xl font-semibold mb-3">{it.t}</div>
            <p className="text-[var(--muted)] leading-relaxed">{it.d}</p>
          </div>
        ))}
      </section>

      <section className="px-8 max-w-5xl mx-auto pb-20">
        <div className="bg-[var(--card)]/60 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-3">两种购买方式</h3>
          <div className="grid md:grid-cols-2 gap-5 text-sm text-[var(--muted)] leading-relaxed">
            <div>
              <span className="text-white font-medium">网站直购：</span>注册账号 → 微信/支付宝付款 → 自动到账。适合急用、想直接搞定的用户。
            </div>
            <div>
              <span className="text-white font-medium">咸鱼下单：</span>店铺购买 → 收到兑换码 → 控制台输入。适合习惯咸鱼交易、有店铺信任度的用户。
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center py-6 text-sm text-[var(--muted)] border-t border-white/5">
        © 2026 笔润 · 学术润色辅助 · 仅供降AI味学习参考，请用户自行确保学术诚信
      </footer>
    </main>
  );
}
