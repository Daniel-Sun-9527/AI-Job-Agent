import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "127.0.0.1";
const isProduction = process.env.NODE_ENV === "production" || process.argv.includes("--production");

await loadLocalEnv();

const vite = isProduction
  ? null
  : await createViteServer({
      root,
      server: { middlewareMode: true },
      appType: "spa"
    });

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || `${host}:${port}`}`);

    if (url.pathname === "/api/enhance") {
      await handleEnhance(req, res);
      return;
    }

    if (vite) {
      vite.middlewares(req, res, () => {
        sendJson(res, 404, { error: "未找到该页面或接口。" });
      });
      return;
    }

    await serveStatic(req, res, url.pathname);
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : "服务异常。" });
  }
});

server.listen(port, host, () => {
  console.log(`AI Job Agent running at http://${host}:${port}`);
});

async function loadLocalEnv() {
  const envPath = path.join(root, ".env");

  try {
    const content = await fs.readFile(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    return;
  }
}

async function handleEnhance(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "该接口只支持POST请求。" });
    return;
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    sendJson(res, 503, {
      code: "missing_api_key",
      error: "AI_API_KEY 未配置。请复制 .env.example 为 .env，填写模型服务Key；也可以先继续使用可复制Prompt。"
    });
    return;
  }

  const payload = await readJson(req);
  const prompt = buildPrompt(payload);
  const result = await callModel(prompt, apiKey);
  sendJson(res, 200, { result });
}

async function callModel(prompt, apiKey) {
  const baseUrl = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL || "gpt-4.1-mini";
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 30000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 2600,
        messages: [
          {
            role: "system",
            content:
              "你是严谨的AI产品经理求职教练。你只能基于用户提供的JD、简历和规则分析输出建议，不得编造经历。请只输出合法JSON，不要输出Markdown。"
          },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const providerMessage = data?.error?.message || data?.message || JSON.stringify(data || {});
      throw new Error(`模型服务请求失败：${response.status}。${providerMessage}`);
    }

    const content = data?.choices?.[0]?.message?.content || "";
    return normalizeAiResult(content);
  } finally {
    clearTimeout(timer);
  }
}

function buildPrompt(payload) {
  return `${payload?.prompt || ""}

【结构化输入兜底】
注意：下面的目标JD、候选人简历和规则引擎结果就是本次任务的有效输入。即使上方Prompt较短，也必须优先使用下面的结构化输入进行分析。除非对应字段真的为空，否则不要回答“缺少JD”“缺少简历”。

目标JD：
${payload?.jd || "缺少JD"}

候选人简历/项目经历：
${payload?.resume || "缺少简历"}

规则引擎结果JSON：
${JSON.stringify(payload?.analysis || {}, null, 2)}

请严格输出如下JSON结构，字段名保持英文，字段值使用中文：
{
  "roleProfile": "一句话概括该岗位真正要找的人",
  "advantages": ["不超过4条，必须引用简历或规则分析中的证据"],
  "requirementMatches": [
    {
      "requirement": "从JD中抽取的一条关键要求",
      "level": "matched|partial|missing 三选一",
      "evidence": "候选人简历中的对应证据；如果没有证据，写缺少证据",
      "action": "下一步补证方式或面试追问建议"
    }
  ],
  "gapPriorities": ["不超过4条，按优先级排列，每条包含原因和7天内补证方式"],
  "resumeBullets": ["不超过4条，按场景/用户 -> 问题 -> 行动 -> AI方法/工具 -> 结果/指标改写"],
  "interviewQuestions": ["不超过5条，贴近JD和候选人经历的追问"],
  "sevenDayPlan": ["7条，每天一条行动，必须可执行"],
  "badcaseRisks": ["不超过4条，指出可能误判、幻觉或隐私风险"],
  "knowledgeCitations": ["列出实际参考的RAG知识片段ID，如KB-001、KB-003；如果没有使用，返回空数组"]
}

额外约束：
- 如果没有证据，请写“缺少证据”，不要脑补。
- 不要替候选人承诺没有完成过的结果。
- 输出要帮助候选人真正改简历、补项目、准备面试，而不是泛泛鼓励。`;
}

function normalizeAiResult(content) {
  const fallback = {
    roleProfile: "模型未返回可解析JSON，请查看原始输出并手动判断。",
    advantages: [],
    requirementMatches: [],
    gapPriorities: [],
    resumeBullets: [],
    interviewQuestions: [],
    sevenDayPlan: [],
    badcaseRisks: [],
    knowledgeCitations: [],
    raw: content
  };

  try {
    const jsonText = extractJson(content);
    const parsed = JSON.parse(jsonText);
    return normalizeParsedResult(parsed, content);
  } catch {
    return fallback;
  }
}

function normalizeParsedResult(parsed, originalContent) {
  const fallback = {
    roleProfile: "模型未返回可解析JSON，请查看原始输出并手动判断。",
    advantages: [],
    requirementMatches: [],
    gapPriorities: [],
    resumeBullets: [],
    interviewQuestions: [],
    sevenDayPlan: [],
    badcaseRisks: [],
    knowledgeCitations: [],
    raw: originalContent
  };

  return {
    roleProfile: String(parsed.roleProfile || fallback.roleProfile),
    advantages: toStringArray(parsed.advantages),
    requirementMatches: toRequirementMatches(parsed.requirementMatches),
    gapPriorities: toStringArray(parsed.gapPriorities),
    resumeBullets: toStringArray(parsed.resumeBullets),
    interviewQuestions: toStringArray(parsed.interviewQuestions),
    sevenDayPlan: toStringArray(parsed.sevenDayPlan),
    badcaseRisks: toStringArray(parsed.badcaseRisks),
    knowledgeCitations: toStringArray(parsed.knowledgeCitations),
    raw: parsed.raw ? String(parsed.raw) : undefined
  };
}

function extractJson(content) {
  const trimmed = String(content || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

function toStringArray(value) {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];
}

function toRequirementMatches(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      requirement: String(item?.requirement || "").trim(),
      level: normalizeMatchLevel(item?.level),
      evidence: String(item?.evidence || "缺少证据").trim(),
      action: String(item?.action || "补充可验证的项目动作、结果指标或复盘材料。").trim()
    }))
    .filter((item) => item.requirement);
}

function normalizeMatchLevel(level) {
  if (level === "matched" || level === "强匹配") return "matched";
  if (level === "missing" || level === "缺证据") return "missing";
  return "partial";
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

async function serveStatic(req, res, pathname) {
  const dist = path.join(root, "dist");
  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const requested = path.join(dist, safePath === "/" ? "index.html" : safePath);

  try {
    const stat = await fs.stat(requested);
    if (stat.isDirectory()) {
      await sendFile(res, path.join(requested, "index.html"));
      return;
    }
    await sendFile(res, requested);
  } catch {
    await sendFile(res, path.join(dist, "index.html"));
  }
}

async function sendFile(res, filePath) {
  const data = await fs.readFile(filePath);
  const ext = path.extname(filePath);
  const type =
    ext === ".html"
      ? "text/html;charset=utf-8"
      : ext === ".js"
        ? "text/javascript;charset=utf-8"
        : ext === ".css"
          ? "text/css;charset=utf-8"
          : "application/octet-stream";
  res.writeHead(200, { "Content-Type": type });
  res.end(data);
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json;charset=utf-8" });
  res.end(JSON.stringify(data));
}
