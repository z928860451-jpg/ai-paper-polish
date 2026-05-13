import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "笔润 · AI论文降重降AI味",
  description: "学术文本润色平台，降低AI特征与查重率，0.05元/字按需付费",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
