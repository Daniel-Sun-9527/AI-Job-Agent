import type { AnalysisResult, RequirementMatch } from "./agent";
import {
  formatRetrievedKnowledgeForPrompt,
  retrieveKnowledge,
  type RetrievedKnowledge
} from "../data/knowledgeBase";
import { formatFewShotsForPrompt, formatRubricForPrompt } from "../data/professionalRubric";

export type AiEnhancementGuide = {
  productGoal: string;
  prompt: string;
  safetyNotes: string[];
  nextApiSteps: string[];
  retrievedKnowledge: RetrievedKnowledge[];
};

export type AiEnhancementResult = {
  roleProfile: string;
  advantages: string[];
  requirementMatches: RequirementMatch[];
  gapPriorities: string[];
  resumeBullets: string[];
  interviewQuestions: string[];
  sevenDayPlan: string[];
  badcaseRisks: string[];
  knowledgeCitations: string[];
  raw?: string;
};

export type AiQualityCheck = {
  label: string;
  score: number;
  status: "通过" | "需复核" | "高风险";
  detail: string;
};

export type AiEnhancementPayload = {
  jd: string;
  resume: string;
  analysis: AnalysisResult;
  prompt: string;
};

export function buildAiEnhancementGuide(jd: string, resume: string, analysis: AnalysisResult): AiEnhancementGuide {
  const weakest = [...analysis.skillScores].sort((a, b) => a.score - b.score)[0];
  const strongest = [...analysis.skillScores].sort((a, b) => b.score - a.score)[0];
  const retrievedKnowledge = retrieveKnowledge(
    `${jd}\n${resume}\n${analysis.skillScores.map((item) => `${item.label} ${item.evidence.join(" ")} ${item.gaps.join(" ")}`).join("\n")}\n${analysis.badcases.join("\n")}`
  );

  const prompt = `你是一名资深AI产品经理和校招求职教练。请基于以下JD、候选人经历和规则引擎分析结果，输出一份更精准的求职优化建议。

要求：
1. 不要编造候选人没有做过的经历；
2. 所有建议必须能在7天内执行；
3. 简历改写必须遵循“场景/用户 -> 问题 -> 行动 -> AI方法/工具 -> 结果/指标”的结构；
4. 标出每条建议对应的证据来源或缺失证据；
5. 输出结构：岗位画像、匹配优势、缺口优先级、简历Bullet、面试追问、7天补强计划、Badcase风险。
6. 必须遵循下方专业评估Rubric和Few-shot样例，不要把工具名、身份标题、兴趣描述误判为强证据。
7. 必须优先参考RAG检索到的知识片段，并在knowledgeCitations中列出实际用到的知识片段ID。

【RAG检索到的知识库参考】
${formatRetrievedKnowledgeForPrompt(retrievedKnowledge)}

【AI产品求职专业评估Rubric】
${formatRubricForPrompt()}

【Few-shot判断样例】
${formatFewShotsForPrompt()}

【目标JD】
${jd}

【候选人经历】
${resume}

【规则引擎分析摘要】
总匹配度：${analysis.totalScore}/100
当前优势：${strongest.label}
优先补强：${weakest.label}
Badcase风险：
${analysis.badcases.map((item) => `- ${item}`).join("\n")}
`;

  return {
    productGoal: "在规则分析结果之上，用大模型补充语义理解、表达润色和个性化行动计划，但保留规则引擎作为可解释的保底层。",
    prompt,
    retrievedKnowledge,
    safetyNotes: [
      "不要在前端保存或暴露API Key；后续接模型时应通过后端代理调用。",
      "简历和JD可能包含隐私信息，开源演示必须使用脱敏样例。",
      "大模型输出需要用户确认，不能自动替用户投递或伪造经历。",
      "保留规则引擎分数和证据匹配，避免大模型只给流畅但不可解释的建议。"
    ],
    nextApiSteps: [
      "后端接口：/api/enhance，用环境变量读取模型服务Key，避免前端泄露密钥。",
      "把JD、简历、规则分析结果组装成结构化Prompt，请求模型输出JSON。",
      "用本地RAG知识库检索岗位标准、简历方法、面试经验和评测方法，作为模型判断参考。",
      "前端渲染AI增强建议，并明确标注“模型生成，需人工确认”。",
      "持续用评测集和Badcase看板对比规则版与AI增强版在准确性、可执行性、幻觉率上的差异。"
    ]
  };
}

export async function requestAiEnhancement(payload: AiEnhancementPayload): Promise<AiEnhancementResult> {
  const response = await fetch("/api/enhance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error || "AI增强请求失败，请检查后端服务和模型配置。";
    throw new Error(message);
  }

  return data.result as AiEnhancementResult;
}

export function evaluateAiEnhancementResult(
  result: AiEnhancementResult,
  jd: string,
  resume: string,
  analysis: AnalysisResult
): AiQualityCheck[] {
  const allText = [
    result.roleProfile,
    ...result.advantages,
    ...result.requirementMatches.map((item) => `${item.requirement} ${item.evidence} ${item.action}`),
    ...result.gapPriorities,
    ...result.resumeBullets,
    ...result.interviewQuestions,
    ...result.sevenDayPlan,
    ...result.badcaseRisks,
    ...(result.knowledgeCitations ?? [])
  ].join("\n");

  const requiredSections = [
    result.roleProfile,
    result.advantages,
    result.requirementMatches,
    result.gapPriorities,
    result.resumeBullets,
    result.interviewQuestions,
    result.sevenDayPlan,
    result.badcaseRisks,
    result.knowledgeCitations ?? []
  ];
  const completeCount = requiredSections.filter((section) =>
    Array.isArray(section) ? section.length > 0 : Boolean(section?.trim())
  ).length;
  const completenessScore = Math.round((completeCount / requiredSections.length) * 100);

  const jdKeywords = extractKeywords(jd);
  const resumeKeywords = extractKeywords(resume);
  const evidenceHits = [...jdKeywords, ...resumeKeywords].filter((word) => allText.includes(word)).length;
  const evidenceScore = Math.min(100, Math.round((evidenceHits / Math.max(6, jdKeywords.length + resumeKeywords.length)) * 120));

  const actionWords = ["第", "天", "输出", "补充", "改写", "验证", "记录", "复盘", "访谈", "原型", "指标"];
  const actionHits = actionWords.filter((word) => allText.includes(word)).length;
  const sevenDayReady = result.sevenDayPlan.length >= 5 ? 30 : 0;
  const actionabilityScore = Math.min(100, actionHits * 8 + sevenDayReady);

  const riskyMetrics = allText.match(/\d+(\.\d+)?\s*(%|人|次|天|周|月|个|份)/g) || [];
  const unsupportedMetrics = riskyMetrics.filter((metric) => !resume.includes(metric.replace(/\s+/g, "")) && !resume.includes(metric));
  const fabricatedOutcomeWords = ["提升", "增长", "转化率", "留存", "上线后", "商业化"].filter(
    (word) => allText.includes(word) && !resume.includes(word)
  );
  const riskPenalty = unsupportedMetrics.length * 12 + fabricatedOutcomeWords.length * 10;
  const hallucinationScore = Math.max(0, 100 - riskPenalty);

  return [
    buildQualityCheck("结构完整性", completenessScore, "是否覆盖岗位画像、优势、缺口、简历、面试、计划和风险。"),
    buildQualityCheck("证据扎根度", evidenceScore, "输出是否引用了JD和简历中真实出现的能力词、工具或项目。"),
    buildQualityCheck("行动可执行性", actionabilityScore, "建议是否能转化成7天内可完成的具体动作。"),
    buildQualityCheck(
      "幻觉风险控制",
      hallucinationScore,
      unsupportedMetrics.length || fabricatedOutcomeWords.length
        ? `发现可能缺证据的指标或结果表达：${[...unsupportedMetrics, ...fabricatedOutcomeWords].slice(0, 5).join("、")}`
        : `未发现明显无证据指标；规则引擎Badcase数量：${analysis.badcases.length}。`
    )
  ];
}

function buildQualityCheck(label: string, score: number, detail: string): AiQualityCheck {
  const status = score >= 75 ? "通过" : score >= 50 ? "需复核" : "高风险";
  return { label, score, status, detail };
}

function extractKeywords(text: string): string[] {
  const candidates = [
    "Agent",
    "RAG",
    "Prompt",
    "Workflow",
    "PRD",
    "原型",
    "需求",
    "调研",
    "数据",
    "指标",
    "复盘",
    "上线",
    "Coze",
    "Dify",
    "Cursor",
    "ChatGPT",
    "Kimi",
    "竞品",
    "用户",
    "测试",
    "知识库",
    "多模态",
    "AIGC"
  ];
  return Array.from(new Set(candidates.filter((word) => text.includes(word))));
}
