"use client";
import { useState } from "react";

// 半自动收款页：贴个人微信收款码 + 邮箱核单 + 客服联系
// 适用场景：还没拿到代付平台商户号、想0门槛先把生意跑起来
export default function BuyPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [orderEmail, setOrderEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">购买使用次数 · 半自动版</h1>
      <p className="text-[var(--muted)] mb-8">单次 ¥9.9，付款后5-30分钟内人工发码到你的注册邮箱。</p>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`flex-1 h-1.5 rounded-full ${step >= n ? "bg-[var(--accent)]" : "bg-white/10"}`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="bg-[var(--card)] rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-4">第 1 步：扫码付款</h2>
          <p className="text-[var(--muted)] mb-6">扫下方微信收款码，转账金额 <span className="text-white font-bold">¥9.9</span>（每多购一次加 9.9）。<br/>
            <span className="text-amber-400 text-sm">⚠️ 付款时<b>务必</b>在备注里填你注册时用的邮箱，否则我们没法关联到你的账号。</span>
          </p>
          <div className="flex flex-col items-center bg-white rounded-lg p-6 mb-6">
            <img src="/pay/wechat-qr.jpg" alt="微信收款码" className="w-72 h-auto" />
          </div>
          <button onClick={() => setStep(2)} className="w-full py-3 rounded-lg bg-[var(--accent)] text-white font-medium">
            我已付款，下一步
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-[var(--card)] rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-4">第 2 步：登记订单</h2>
          <p className="text-[var(--muted)] mb-4">填你的注册邮箱，我们会用它定位账号并直接给你加次数 / 发兑换码：</p>
          <input
            type="email"
            value={orderEmail}
            onChange={(e) => setOrderEmail(e.target.value)}
            placeholder="你注册账号用的邮箱"
            className="w-full p-3 mb-6 bg-[var(--bg)] rounded border border-white/10 outline-none focus:border-[var(--accent)]"
          />
          <p className="text-sm text-[var(--muted)] mb-3">
            付款截图（可选，加快核单）：把微信付款成功页截图，加客服微信发过来。
          </p>
          <button
            onClick={() => {
              if (!orderEmail.trim()) { alert("邮箱必填"); return; }
              // 把订单信息存到 localStorage 备查（真生产可以打个POST到/api/manual-order备案）
              const order = { email: orderEmail, time: new Date().toISOString() };
              localStorage.setItem("birun_manual_order_" + Date.now(), JSON.stringify(order));
              setSubmitted(true);
              setStep(3);
            }}
            className="w-full py-3 rounded-lg bg-[var(--accent)] text-white font-medium"
          >
            提交登记
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="bg-[var(--card)] rounded-xl p-8 text-center">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-xl font-semibold mb-3">登记完成，等通知</h2>
          <p className="text-[var(--muted)] mb-6 leading-relaxed">
            我们看到付款后会在 5-30 分钟内（夜间次日 9 点起）：<br/>
            ① 在你的账号上<b className="text-white">直接加次数</b>，登录刷新即可使用<br/>
            ② 或发兑换码到 <b className="text-white">{orderEmail}</b>
          </p>
          <div className="text-sm text-[var(--muted)] mb-6 bg-[var(--bg)] rounded p-4 leading-relaxed">
            <b className="text-white">急用？</b>加客服微信 <span className="text-[var(--accent)]">birun-helper</span><br/>
            发付款截图 + 邮箱，2分钟内秒回
          </div>
          <a href="/dashboard" className="inline-block px-6 py-2 rounded bg-[var(--accent)] text-white">回控制台</a>
        </div>
      )}

      <div className="mt-8 text-xs text-[var(--muted)] text-center leading-relaxed">
        我们也支持咸鱼下单：搜索店铺<b className="text-white">「笔润降AI味」</b>，下单后会收到兑换码，回 <a href="/dashboard" className="text-[var(--accent)]">控制台</a> 输入即可。
      </div>
    </main>
  );
}
