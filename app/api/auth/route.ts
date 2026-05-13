import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password, action } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "邮箱和密码必填" }, { status: 400 });
  }

  if (action === "register") {
    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "密码至少6位" }, { status: 400 });
    }
    const exist = await prisma.user.findUnique({ where: { email } });
    if (exist) return NextResponse.json({ error: "邮箱已注册" }, { status: 409 });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hash },
    });
    const token = signToken({ userId: user.id, email });
    const res = NextResponse.json({ ok: true, email });
    res.cookies.set("token", token, { httpOnly: true, maxAge: 30 * 86400, path: "/" });
    return res;
  }

  // login
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
  const token = signToken({ userId: user.id, email });
  const res = NextResponse.json({ ok: true, email });
  res.cookies.set("token", token, { httpOnly: true, maxAge: 30 * 86400, path: "/" });
  return res;
}
