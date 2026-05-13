// 兑换码工具：生成、核销、批量生成
import { prisma } from "./db";

// 生成12位大写字母数字（去除易混淆字符）
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function genCode(len = 12): string {
  let s = "";
  for (let i = 0; i < len; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `BR-${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}`;
}

export async function batchGenerate(count: number, source = "xianyu", note?: string) {
  const codes: { code: string; source: string; note?: string }[] = [];
  for (let i = 0; i < count; i++) {
    let code: string;
    let exists = true;
    while (exists) {
      code = genCode();
      const dup = await prisma.redeemCode.findUnique({ where: { code } });
      exists = !!dup;
    }
    codes.push({ code: code!, source, note });
  }
  await prisma.redeemCode.createMany({ data: codes });
  return codes.map((c) => c.code);
}

// 核销兑换码：原子操作，避免并发重复使用
export async function redeem(code: string, userId: string) {
  const trimmed = code.trim().toUpperCase();
  return await prisma.$transaction(async (tx) => {
    const c = await tx.redeemCode.findUnique({ where: { code: trimmed } });
    if (!c) return { ok: false, error: "兑换码不存在" };
    if (c.status === "used") return { ok: false, error: "兑换码已被使用" };
    if (c.status === "disabled") return { ok: false, error: "兑换码已作废" };

    await tx.redeemCode.update({
      where: { code: trimmed },
      data: { status: "used", usedBy: userId, usedAt: new Date() },
    });
    await tx.user.update({
      where: { id: userId },
      data: { uses: { increment: 1 } },
    });
    return { ok: true };
  });
}
