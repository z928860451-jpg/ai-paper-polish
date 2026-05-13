"use client";
import { useState } from "react";

export default function AdminCodes() {
  const [secret, setSecret] = useState("");
  const [count, setCount] = useState(10);
  const [note, setNote] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify({ count, note }),
      });
      const d = await r.json();
      if (!r.ok) { alert(d.error); return; }
      setCodes(d.codes);
    } finally {
      setLoading(false);
    }
  }

  async function loadList(status?: string) {
    const url = status ? `/api/admin/codes?status=${status}` : "/api/admin/codes";
    const r = await fetch(url, { headers: { "x-admin-secret": secret } });
    const d = await r.json();
    if (!r.ok) { alert(d.error); return; }
    setList(d.list);
  }

  // ====== 手工加次数（半自动收款用）======
  const [grantEmail, setGrantEmail] = useState("");
  const [grantUses, setGrantUses] = useState(1);
  const [grantMsg, setGrantMsg] = useState("");
  async function grant() {
    setGrantMsg("");
    const r = await fetch("/api/admin/grant", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ email: grantEmail, uses: grantUses }),
    });
    const d = await r.json();
    if (!r.ok) { setGrantMsg("✗ " + (d.error || "失败")); return; }
    setGrantMsg(`✓ 已给 ${d.email} 加 ${d.addedUses} 次，当前共 ${d.totalUses} 次`);
  }

  function exportCodes() {
    const blob = new Blob([codes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `兑换码_${Date.now()}.txt`;
    a.click();
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">兑换码后台（咸鱼发货专用）</h1>

      <div className="bg-[var(--card)] rounded-lg p-6 mb-6">
        <label className="text-sm text-[var(--muted)]">管理员密钥（来自 .env 的 ADMIN_SECRET）</label>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="w-full mt-2 p-2 bg-[var(--bg)] rounded border border-white/10 outline-none"
          placeholder="ADMIN_SECRET"
        />
      </div>

      <div className="bg-[var(--card)] rounded-lg p-6 mb-6">
        <h2 className="font-semibold mb-4">批量生成</h2>
        <div className="flex gap-3 items-center mb-3">
          <label className="text-sm w-24">数量</label>
          <input type="number" min={1} max={200} value={count} onChange={(e) => setCount(parseInt(e.target.value) || 1)} className="w-24 p-2 bg-[var(--bg)] rounded border border-white/10" />
          <label className="text-sm">备注（如咸鱼订单号）</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} className="flex-1 p-2 bg-[var(--bg)] rounded border border-white/10" />
        </div>
        <button onClick={generate} disabled={loading || !secret} className="px-5 py-2 rounded bg-[var(--accent)] text-white disabled:opacity-50">
          {loading ? "生成中..." : "生成"}
        </button>
        {codes.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-green-400">✓ 已生成 {codes.length} 个</span>
              <button onClick={exportCodes} className="text-xs px-3 py-1 rounded bg-purple-600 text-white">导出txt</button>
            </div>
            <div className="bg-[var(--bg)] rounded p-3 max-h-48 overflow-auto font-mono text-xs">
              {codes.map((c) => <div key={c}>{c}</div>)}
            </div>
          </div>
        )}
      </div>

      <div className="bg-[var(--card)] rounded-lg p-6 mb-6">
        <h2 className="font-semibold mb-1">手工加次数（半自动收款核单）</h2>
        <p className="text-xs text-[var(--muted)] mb-4">看到微信付款备注里的邮箱后，在这里直接给对应账号加次数。会同时建一条paid订单便于对账。</p>
        <div className="flex gap-3 items-center mb-3 flex-wrap">
          <input
            type="email"
            value={grantEmail}
            onChange={(e) => setGrantEmail(e.target.value)}
            placeholder="用户邮箱"
            className="flex-1 min-w-[240px] p-2 bg-[var(--bg)] rounded border border-white/10"
          />
          <input
            type="number"
            min={1}
            max={50}
            value={grantUses}
            onChange={(e) => setGrantUses(parseInt(e.target.value) || 1)}
            className="w-24 p-2 bg-[var(--bg)] rounded border border-white/10"
          />
          <button onClick={grant} disabled={!secret || !grantEmail} className="px-5 py-2 rounded bg-green-600 text-white disabled:opacity-50">
            加次数
          </button>
        </div>
        {grantMsg && <div className="text-sm">{grantMsg}</div>}
      </div>

      <div className="bg-[var(--card)] rounded-lg p-6">
        <h2 className="font-semibold mb-4">查询已发兑换码</h2>
        <div className="flex gap-2 mb-3">
          <button onClick={() => loadList()} className="px-3 py-1.5 rounded bg-[var(--bg)] text-sm">全部</button>
          <button onClick={() => loadList("active")} className="px-3 py-1.5 rounded bg-[var(--bg)] text-sm">未使用</button>
          <button onClick={() => loadList("used")} className="px-3 py-1.5 rounded bg-[var(--bg)] text-sm">已使用</button>
        </div>
        {list.length > 0 && (
          <div className="bg-[var(--bg)] rounded p-3 max-h-96 overflow-auto text-xs">
            <table className="w-full">
              <thead className="text-[var(--muted)]"><tr>
                <th className="text-left p-1">兑换码</th><th className="text-left p-1">状态</th><th className="text-left p-1">备注</th><th className="text-left p-1">创建时间</th>
              </tr></thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id} className="border-t border-white/5">
                    <td className="p-1 font-mono">{c.code}</td>
                    <td className="p-1">{c.status === "active" ? "✓未用" : c.status === "used" ? "已用" : "停用"}</td>
                    <td className="p-1">{c.note || "-"}</td>
                    <td className="p-1">{new Date(c.createdAt).toLocaleString("zh-CN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
