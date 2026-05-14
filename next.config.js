/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",        // 脱离 node_modules 独立运行（CloudBase部署必须）
  images: {
    unoptimized: true,         // 云函数没有Sharp，关闭图片优化
  },
  compress: true,
  poweredByHeader: false,
};
module.exports = nextConfig;
