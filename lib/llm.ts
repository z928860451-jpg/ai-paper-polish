// 调用 DeepSeek API（OpenAI协议兼容）
// 文档：https://api-docs.deepseek.com
//
// 当前可用模型（2026年实测 GET /v1/models 返回）：
//   - deepseek-v4-flash：默认款，响应快、价格低，1000字成本≈0.012元
//   - deepseek-v4-pro  ：高质量款，max_tokens=8192，复杂改写场景使用
//
// 旧版 "deepseek-chat" / "deepseek-v3" 已下线，调用会返回 invalid_model。
// 售价 9.9元/次（去空格不超 1500 字），毛利率 ≥ 95%。

import { buildSystemPrompt, buildUserPrompt, detectLang } from "./anti-aigc-prompt";

const LLM_BASE_URL = process.env.LLM_BASE_URL || "https://api.deepseek.com/v1";
// 默认 flash；高质量模式下从 LLM_MODEL_PRO 读取
const LLM_MODEL_DEFAULT = process.env.LLM_MODEL || "deepseek-v4-flash";
const LLM_MODEL_PRO = process.env.LLM_MODEL_PRO || "deepseek-v4-pro";
const LLM_API_KEY = process.env.LLM_API_KEY || "";

export interface PolishResult {
  output: string;
  inputChars: number;
  outputChars: number;
}

// 长文本分段：按段落切分，单次最多送入约3000字符，DeepSeek上下文够大
function chunkText(text: string, maxLen = 3000): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let buf = "";
  for (const p of paragraphs) {
    if ((buf + "\n\n" + p).length > maxLen && buf) {
      chunks.push(buf);
      buf = p;
    } else {
      buf = buf ? buf + "\n\n" + p : p;
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

/**
 * 单段调用 LLM。
 * @param text 单段原文
 * @param model 实际使用的模型 id（flash 或 pro）
 * @param retries 失败重试次数（429/5xx）
 */
async function callLLM(
  text: string,
  model: string,
  retries = 2
): Promise<string> {
  if (!LLM_API_KEY) throw new Error("LLM_API_KEY未配置");

  // DeepSeek V4 引入了 reasoning_content（思维链）字段，会消耗一部分 max_tokens
  // 配额。flash 配 8192、pro 配 16384，确保 reasoning + content 两部分都装得下，
  // 避免出现"只有思维链、content 为空"的截断问题（用户实测过）。
  const isPro = model.toLowerCase().includes("pro");
  const maxTokens = isPro ? 16384 : 8192;

  // 系统提示词按输入语种自动切分（中英文黑名单不互相串味）
  const systemPrompt = buildSystemPrompt("auto", text);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(`${LLM_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LLM_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: buildUserPrompt(text) },
          ],
          temperature: 0.85,
          top_p: 0.9,
          max_tokens: maxTokens,
          frequency_penalty: 0.4,
          presence_penalty: 0.2,
        }),
      });

      if (!resp.ok) {
        const err = await resp.text();
        // 429限流或5xx，重试
        if ((resp.status === 429 || resp.status >= 500) && attempt < retries) {
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        throw new Error(`LLM调用失败 ${resp.status}: ${err}`);
      }
      const data = await resp.json();
      const choice = data.choices?.[0];
      const content = (choice?.message?.content || "").trim();
      const finishReason = choice?.finish_reason;

      // 边界保护：V4 在 reasoning 阶段如果用尽 max_tokens 会返回空 content + finish_reason="length"
      // 这种情况下视为失败重试一次，避免把空字符串当成功结果返回上层。
      if (!content && finishReason === "length" && attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      return content;
    } catch (e) {
      if (attempt >= retries) throw e;
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  return "";
}

// 并发处理多段：DeepSeek免费额度内可并发3，控制速率避免触发限流
async function processChunksWithConcurrency(
  chunks: string[],
  model: string,
  concurrency = 3
): Promise<string[]> {
  const results: string[] = new Array(chunks.length);
  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, chunks.length) },
    async () => {
      while (true) {
        const idx = cursor++;
        if (idx >= chunks.length) break;
        results[idx] = await callLLM(chunks[idx], model);
      }
    }
  );
  await Promise.all(workers);
  return results;
}

/**
 * 论文降AI润色入口。
 * @param input 原文
 * @param usePro 是否使用 deepseek-v4-pro 高质量模型；默认 false 走 flash
 */
export async function polishText(
  input: string,
  usePro: boolean = false
): Promise<PolishResult> {
  const model = usePro ? LLM_MODEL_PRO : LLM_MODEL_DEFAULT;
  const chunks = chunkText(input);
  const results = await processChunksWithConcurrency(chunks, model, 3);
  const output = results.join("\n\n");
  return {
    output,
    inputChars: input.length,
    outputChars: output.length,
  };
}

// 导出语种探测便于上层路由日志记录
export { detectLang };
