import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg btn-primary flex items-center justify-center text-white text-sm font-bold">笔</div>
            <span className="text-lg font-bold">笔润 BiRun</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/buy" className="text-sm text-[var(--text-secondary)] hover:text-white transition">获取兑换码</Link>
            <Link href="/dashboard" className="btn-primary px-5 py-2 rounded-lg text-sm text-white font-medium">开始使用</Link>
          </div>
        </div>
      </nav>

      {/* Hero区域 */}
      <section className="hero-gradient pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-glow)] border border-[var(--accent)]/30 text-sm text-[var(--accent-light)] mb-8">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></span>
            维普实测 42.68% → 18.1%，降幅24.58个百分点
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
            AI写的论文<br/>
            <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] bg-clip-text text-transparent">一键变成人写的</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] mb-4 max-w-2xl mx-auto leading-relaxed">
            基于知网困惑度+维普指纹比对双引擎对抗策略，语义重构式改写（不是同义词替换），
            交付改写稿Word + 量化分析报告。
          </p>
          <p className="text-3xl font-bold mt-8 mb-10">
            ¥9.9<span className="text-base font-normal text-[var(--text-secondary)] ml-2">/次 · 单次≤5万字 · 兑换码即用</span>
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard" className="btn-primary px-8 py-3.5 rounded-xl text-white font-semibold text-base">
              立即降AI味
            </Link>
            <a href="#case" className="px-8 py-3.5 rounded-xl border border-[var(--border-hover)] text-[var(--text-secondary)] hover:text-white hover:border-white/20 transition font-medium">
              查看实测效果 ↓
            </a>
          </div>
        </div>
      </section>

      {/* 实测案例对比 */}
      <section id="case" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">真实维普检测对比</h2>
          <p className="text-[var(--text-secondary)]">同一篇论文，使用笔润改写前后的维普AIGC检测结果</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 改写前 */}
          <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)]">
            <div className="px-5 py-3 flex items-center justify-between border-b border-[var(--border)]">
              <span className="tag-before px-3 py-1 rounded-full text-xs font-medium">改写前</span>
              <span className="text-xs text-[var(--text-secondary)]">2026-05-13 18:33</span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-6 mb-4">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(239,68,68,0.2)" strokeWidth="3"/>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="42.68, 100"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-red-400">42.68%</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">42.68%</div>
                  <div className="text-sm text-[var(--text-secondary)]">疑似AIGC生成占比</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">人工撰写占比 57.32%</div>
                </div>
              </div>
              <img src="/case-before.png" alt="维普检测-改写前" className="w-full rounded-lg border border-[var(--border)] opacity-90"/>
            </div>
          </div>

          {/* 改写后 */}
          <div className="rounded-2xl overflow-hidden border border-[var(--success)]/30 bg-[var(--card)]">
            <div className="px-5 py-3 flex items-center justify-between border-b border-[var(--border)]">
              <span className="tag-after px-3 py-1 rounded-full text-xs font-medium">改写后</span>
              <span className="text-xs text-[var(--text-secondary)]">2026-05-13 11:27</span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-6 mb-4">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(16,185,129,0.2)" strokeWidth="3"/>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="18.1, 100"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-green-400">18.1%</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">18.1%</div>
                  <div className="text-sm text-[var(--text-secondary)]">全文疑似AIGC生成</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">人工写概率 81.9%</div>
                </div>
              </div>
              <img src="/case-after.png" alt="维普检测-改写后" className="w-full rounded-lg border border-[var(--border)] opacity-90"/>
            </div>
          </div>
        </div>

        {/* 效果数字 */}
        <div className="mt-10 glass-card rounded-2xl p-8 text-center">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-[var(--accent-light)] stat-number">-24.58%</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">AIGC率下降</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 stat-number">81.9%</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">人工写概率</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--warning)] stat-number">16,797字</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">单次处理量</div>
            </div>
          </div>
        </div>
      </section>

      {/* 核心能力 */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">为什么选笔润</h2>
          <p className="text-[var(--text-secondary)]">不是同义词替换，是语义重构</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "🎯", t: "对抗知网检测", d: "针对困惑度(Perplexity>50)与突发性(Burstiness>0.42)双指标优化，打破AI文本的机械均匀特征。" },
            { icon: "🛡️", t: "对抗维普检测", d: "拆散短语级指纹匹配，段落间差异化改写避免风格均匀度触发，覆盖DeepSeek特征对抗。" },
            { icon: "📄", t: "双文件交付", d: "输出格式规范的Word改写稿（宋体/首行缩进）+ 量化分析报告（AI词命中/句长方差/查重对比）。" },
          ].map((it) => (
            <div key={it.t} className="glass-card rounded-xl p-6 hover:border-[var(--accent)]/30 transition group">
              <div className="text-3xl mb-4">{it.icon}</div>
              <div className="text-lg font-semibold mb-2 group-hover:text-[var(--accent-light)] transition">{it.t}</div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{it.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 使用流程 */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">3步完成</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          {[
            { step: "1", t: "输入兑换码", d: "咸鱼购买或扫码付款获取" },
            { step: "2", t: "粘贴/上传论文", d: "支持文本粘贴和docx上传" },
            { step: "3", t: "下载改写结果", d: "30-60秒出稿，双文件下载" },
          ].map((it, i) => (
            <div key={it.step} className="flex items-center gap-4">
              <div className="flex flex-col items-center text-center w-40">
                <div className="w-12 h-12 rounded-full btn-primary flex items-center justify-center text-white text-lg font-bold mb-3">{it.step}</div>
                <div className="font-semibold mb-1">{it.t}</div>
                <div className="text-xs text-[var(--text-secondary)]">{it.d}</div>
              </div>
              {i < 2 && <div className="hidden md:block text-[var(--text-secondary)] text-2xl">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* 购买方式 */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="glass-card rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 text-center">两种获取方式</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[var(--bg)] rounded-xl p-5 border border-[var(--border)]">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💬</span>
                <span className="font-semibold">微信扫码付款</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">扫码转账¥9.9 → 备注邮箱 → 5-30分钟内收到兑换码</p>
              <Link href="/buy" className="inline-block mt-3 text-sm text-[var(--accent-light)]">去付款 →</Link>
            </div>
            <div className="bg-[var(--bg)] rounded-xl p-5 border border-[var(--border)]">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🐟</span>
                <span className="font-semibold">咸鱼下单</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">搜索「笔润降AI味」→ 下单后自动发兑换码 → 回本站输入使用</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--text-secondary)]">
          <div>© 2026 笔润 BiRun · 学术润色辅助工具</div>
          <div>仅供降AI味学习参考，请用户自行确保学术诚信</div>
        </div>
      </footer>
    </main>
  );
}
