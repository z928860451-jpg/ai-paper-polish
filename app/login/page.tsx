"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [action, setAction] = useState<"login" | "register">("login");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const r = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, action }),
    });
    const d = await r.json();
    if (!r.ok) { setError(d.error); return; }
    location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="bg-[var(--card)] rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">{action === "login" ? "登录" : "注册"}</h1>
        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-3 bg-[var(--bg)] rounded border border-white/10 outline-none focus:border-[var(--accent)]"
        />
        <input
          type="password"
          placeholder="密码（至少6位）"
          value={password}
          minLength={6}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 bg-[var(--bg)] rounded border border-white/10 outline-none focus:border-[var(--accent)]"
        />
        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
        <button onClick={submit} className="w-full py-3 rounded bg-[var(--accent)] text-white font-medium">
          {action === "login" ? "登录" : "注册"}
        </button>
        <div className="text-center mt-4 text-sm text-[var(--muted)]">
          {action === "login" ? (
            <>没账号？<button onClick={() => setAction("register")} className="text-[var(--accent)]">去注册</button></>
          ) : (
            <>已有账号？<button onClick={() => setAction("login")} className="text-[var(--accent)]">去登录</button></>
          )}
        </div>
      </div>
    </main>
  );
}
