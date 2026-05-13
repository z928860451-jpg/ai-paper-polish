// 虎皮椒支付接入（个人开发者最常用的微信/支付宝聚合通道）
// 文档：https://www.xunhupay.com/doc/api/pay.html
//
// 协议版本：v1.1（虎皮椒当前在用），下单接口要求：
//   - type 字段统一传 "WAP"（聚合 H5 收银台），不再区分 ALIPAY/WECHAT
//   - 具体支付方式由独立的 payment 字段决定：wechat | alipay
//   - wap_url / wap_name 必填，且 wap_url 必须是已备案、能被虎皮椒回调访问的域名

import md5 from "md5";

const APP_ID = process.env.XUNHU_APPID || "";
const APP_SECRET = process.env.XUNHU_APPSECRET || "";
const NOTIFY_URL =
  process.env.XUNHU_NOTIFY_URL || "https://yourdomain.com/api/payment/notify";
const RETURN_URL =
  process.env.XUNHU_RETURN_URL || "https://yourdomain.com/dashboard";

/**
 * 提取 NOTIFY_URL 的 host 作为 wap_url 默认值。
 * 例如 https://birun.xx.com/api/payment/notify -> birun.xx.com
 * 配置异常时返回空串，让虎皮椒返回校验错误而不是用占位符。
 */
function extractHostFromNotifyUrl(): string {
  try {
    const u = new URL(NOTIFY_URL);
    return u.host;
  } catch {
    return "";
  }
}

const WAP_URL = process.env.XUNHU_WAP_URL || extractHostFromNotifyUrl();
const WAP_NAME = process.env.XUNHU_WAP_NAME || "笔润BiRun";

// 虎皮椒MD5签名：参数按key升序拼接，最后追加appsecret
// 过滤规则：保留 0、false 等"有意义的非空值"，只剔除 ""/undefined/null
function sign(params: Record<string, any>): string {
  const keys = Object.keys(params)
    .filter(
      (k) =>
        k !== "hash" &&
        params[k] !== "" &&
        params[k] !== undefined &&
        params[k] !== null
    )
    .sort();
  const str = keys.map((k) => `${k}=${params[k]}`).join("&") + APP_SECRET;
  return md5(str);
}

export interface CreatePayResp {
  url: string; // PC支付页URL
  url_qrcode: string; // 二维码图片URL（可选）
  oderId: string;
}

export async function createXunhuPay(opts: {
  outTradeNo: string;
  totalFen: number;
  title: string;
  payType: "wechat" | "alipay";
}): Promise<CreatePayResp> {
  const params: Record<string, any> = {
    version: "1.1",
    appid: APP_ID,
    trade_order_id: opts.outTradeNo,
    total_fee: (opts.totalFen / 100).toFixed(2), // 元
    title: opts.title,
    time: Math.floor(Date.now() / 1000),
    notify_url: NOTIFY_URL,
    return_url: RETURN_URL,
    nonce_str: Math.random().toString(36).slice(2, 12),
    // 协议 v1.1 约定：type 固定 "WAP"，payment 决定具体渠道
    type: "WAP",
    payment: opts.payType === "wechat" ? "wechat" : "alipay",
    wap_url: WAP_URL,
    wap_name: WAP_NAME,
  };
  params.hash = sign(params);

  const resp = await fetch("https://api.xunhupay.com/payment/do.html", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params as any).toString(),
  });
  const data = await resp.json();
  if (data.errcode !== 0) {
    throw new Error(`虎皮椒下单失败: ${data.errmsg || JSON.stringify(data)}`);
  }
  return { url: data.url, url_qrcode: data.url_qrcode, oderId: data.oderId };
}

export function verifyXunhuNotify(params: Record<string, any>): boolean {
  const incomingHash = params.hash;
  const expected = sign(params);
  return incomingHash === expected;
}
