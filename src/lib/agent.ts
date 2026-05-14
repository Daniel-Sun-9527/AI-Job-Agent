export type SkillKey = "product" | "ai" | "data" | "builder" | "delivery" | "story";

export type SkillScore = {
  key: SkillKey;
  label: string;
  score: number;
  evidence: string[];
  gaps: string[];
};

export type RequirementMatch = {
  requirement: string;
  level: "matched" | "partial" | "missing";
  evidence: string;
  action: string;
};

export type AnalysisResult = {
  totalScore: number;
  summary: string;
  skillScores: SkillScore[];
  requirementMatches: RequirementMatch[];
  resumeBullets: string[];
  interviewQuestions: string[];
  projectPlan: string[];
  badcases: string[];
  exportMarkdown: string;
};

type KeywordRule = {
  key: SkillKey;
  label: string;
  keywords: string[];
  strongSignals: string[];
  gapHints: string[];
};

type RequirementRule = {
  requirement: string;
  keywords: string[];
  strongSignals: string[];
  actionIfPartial: string;
  actionIfMissing: string;
};

const rules: KeywordRule[] = [
  {
    key: "product",
    label: "产品基本功",
    keywords: ["需求", "PRD", "原型", "流程", "竞品", "用户", "场景", "验收", "Axure", "Figma"],
    strongSignals: ["用户访谈", "竞品分析", "PRD", "验收标准", "原型", "优先级"],
    gapHints: ["补一份完整PRD", "补核心流程图", "补验收标准和优先级判断"]
  },
  {
    key: "ai",
    label: "AI应用理解",
    keywords: ["AI", "大模型", "LLM", "Agent", "RAG", "Prompt", "多模态", "AIGC", "知识库", "幻觉"],
    strongSignals: ["Agent", "RAG", "Prompt", "知识库", "多模态", "模型评测"],
    gapHints: ["解释RAG和Agent的适用场景", "补AI能力边界分析", "补模型失败类型总结"]
  },
  {
    key: "data",
    label: "数据与评测",
    keywords: ["数据", "指标", "SQL", "Excel", "转化", "留存", "点击率", "评测", "Badcase", "复盘"],
    strongSignals: ["SQL", "指标", "Badcase", "评测", "复盘", "转化", "命中率"],
    gapHints: ["补评测集和指标", "补上线后数据复盘", "补Badcase分类表"]
  },
  {
    key: "builder",
    label: "Builder能力",
    keywords: ["Dify", "Coze", "Cursor", "Claude Code", "Copilot", "Demo", "API", "Python", "小工具", "自动化", "React", "TypeScript"],
    strongSignals: ["Demo", "Dify", "Coze", "Cursor", "Python", "API", "React", "TypeScript"],
    gapHints: ["做一个可演示Demo", "补GitHub链接或录屏", "补工具链说明"]
  },
  {
    key: "delivery",
    label: "落地推进",
    keywords: ["推动", "协作", "开发", "设计", "测试", "上线", "项目", "排期", "沟通", "质量", "迭代"],
    strongSignals: ["推动开发", "上线", "测试", "跨团队", "协作", "迭代", "对接"],
    gapHints: ["补项目节奏和协作角色", "补上线/测试过程", "补风险与取舍"]
  },
  {
    key: "story",
    label: "作品集表达",
    keywords: ["作品", "博客", "GitHub", "报告", "文档", "总结", "复盘", "公众号", "开源", "链接", "README", "Roadmap"],
    strongSignals: ["GitHub", "博客", "作品集", "报告", "复盘", "公众号", "README", "Roadmap"],
    gapHints: ["整理Notion/博客作品集", "补README和项目截图", "补一页纸项目复盘"]
  }
];

const requirementRules: RequirementRule[] = [
  {
    requirement: "需求调研与场景分析",
    keywords: ["用户", "调研", "访谈", "场景", "痛点", "需求", "使用路径", "市场调研"],
    strongSignals: ["访谈", "调研", "拆解", "定位", "痛点"],
    actionIfPartial: "补充调研对象、样本数量、核心发现和需求优先级。",
    actionIfMissing: "补一个小型用户调研：访谈5名目标用户，输出场景、痛点和需求列表。"
  },
  {
    requirement: "PRD/原型/流程图",
    keywords: ["PRD", "原型", "流程图", "Figma", "Axure", "信息架构", "验收标准", "需求文档"],
    strongSignals: ["输出PRD", "绘制", "原型", "验收标准", "信息架构"],
    actionIfPartial: "补充文档产出名称、页面范围、核心流程和验收标准。",
    actionIfMissing: "为当前项目补一份PRD和核心流程图，至少覆盖输入、分析、导出链路。"
  },
  {
    requirement: "AI Agent或RAG工作流",
    keywords: ["Agent", "RAG", "知识库", "Dify", "Coze", "工作流", "检索", "工具调用", "智能体"],
    strongSignals: ["搭建", "配置", "工作流", "知识库", "检索", "Agent"],
    actionIfPartial: "补充Agent/RAG的流程：输入、检索/工具调用、生成、反馈、评测。",
    actionIfMissing: "用Dify或Coze搭一个知识库问答/求职助手Demo，并记录3类Badcase。"
  },
  {
    requirement: "Prompt工程与AI工具使用",
    keywords: ["Prompt", "提示词", "Cursor", "Claude Code", "Copilot", "ChatGPT", "Kimi", "Coze", "Dify"],
    strongSignals: ["设计Prompt", "约束", "模板", "Cursor", "Claude Code", "Copilot"],
    actionIfPartial: "补充你如何设计Prompt模板、约束输出格式、比较不同工具效果。",
    actionIfMissing: "补一组Prompt迭代记录：原始提示词、问题、修改版本、效果变化。"
  },
  {
    requirement: "数据分析与效果评测",
    keywords: ["数据", "指标", "Excel", "SQL", "评测", "Badcase", "命中率", "转化", "点击率", "满意度"],
    strongSignals: ["统计", "记录", "评测", "指标", "Badcase", "命中率", "转化"],
    actionIfPartial: "补充评测样本量、指标定义、结果变化和下一步迭代。",
    actionIfMissing: "建立30条测试样本，记录命中率、可执行性、幻觉率和人工修正率。"
  },
  {
    requirement: "跨团队沟通和项目推进",
    keywords: ["推动", "协作", "沟通", "对接", "开发", "设计", "测试", "上线", "迭代", "团队"],
    strongSignals: ["推动开发", "对接", "协作", "上线", "迭代", "测试"],
    actionIfPartial: "补充你对接了谁、推进了什么决策、如何处理分歧或排期。",
    actionIfMissing: "补一段项目推进经历：目标、参与角色、你的动作、交付结果。"
  },
  {
    requirement: "竞品/行业趋势分析",
    keywords: ["竞品", "调研", "趋势", "行业", "国内外", "对比", "案例", "技术报告"],
    strongSignals: ["竞品分析", "对比", "调研", "输出", "总结", "案例"],
    actionIfPartial: "补充竞品名称、比较维度、关键结论和产品启发。",
    actionIfMissing: "选3个同类AI产品做一页纸竞品分析，输出差异点和机会点。"
  },
  {
    requirement: "上线后反馈与迭代",
    keywords: ["上线", "反馈", "复盘", "迭代", "优化", "测试", "用户反馈", "问题"],
    strongSignals: ["上线后", "反馈", "复盘", "迭代", "优化", "测试"],
    actionIfPartial: "补充上线/测试后的问题、反馈来源、迭代动作和结果。",
    actionIfMissing: "补一个最小闭环：找3名用户试用Demo，记录反馈并完成一次迭代。"
  }
];

const actionWords = [
  "负责",
  "参与",
  "设计",
  "使用",
  "搭建",
  "输出",
  "记录",
  "访谈",
  "调研",
  "分析",
  "推动",
  "协助",
  "建立",
  "优化",
  "统计",
  "对比",
  "绘制",
  "配置",
  "拆解",
  "提出",
  "跟进",
  "主导",
  "整理",
  "定位",
  "测试",
  "接入"
];

const weakEvidencePrefixes = ["候选人", "教育经历", "技能", "其他", "岗位", "任职", "要求", "加分项"];
const sectionOnlyPatterns = [/^项目经历[:：]/, /^技能[:：]/, /^教育经历[:：]/, /^候选人[｜|]/];

const splitSentences = (text: string) =>
  text
    .split(/[\n。；;.!！?？]/)
    .map((item) => item.trim().replace(/^[-\d、.\s]+/, ""))
    .filter(Boolean);

const includesAny = (text: string, keywords: string[]) =>
  keywords.some((keyword) => text.toLowerCase().includes(keyword.toLowerCase()));

const countHits = (text: string, keywords: string[]) =>
  keywords.filter((keyword) => text.toLowerCase().includes(keyword.toLowerCase())).length;

const isNoiseSentence = (sentence: string) => {
  if (sentence.length < 8) return true;
  if (sectionOnlyPatterns.some((pattern) => pattern.test(sentence))) return true;
  if (weakEvidencePrefixes.some((prefix) => sentence.startsWith(prefix))) return true;
  return false;
};

const isProjectEvidence = (sentence: string) => includesAny(sentence, actionWords);

const evidenceScore = (sentence: string, keywords: string[], strongSignals: string[]) => {
  const keywordScore = countHits(sentence, keywords) * 4;
  const strongScore = countHits(sentence, strongSignals) * 6;
  const actionScore = isProjectEvidence(sentence) ? 8 : 0;
  const metricScore = /\d+|%|率|指标|样本|用户|访谈/.test(sentence) ? 4 : 0;
  return keywordScore + strongScore + actionScore + metricScore;
};

const findEvidence = (text: string, keywords: string[], strongSignals: string[] = [], limit = 3) =>
  splitSentences(text)
    .filter((sentence) => !isNoiseSentence(sentence))
    .filter((sentence) => includesAny(sentence, keywords))
    .map((sentence) => ({
      sentence,
      score: evidenceScore(sentence, keywords, strongSignals)
    }))
    .filter((item) => item.score >= 8)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.sentence)
    .slice(0, limit);

const getEvidenceCorpus = (text: string) =>
  splitSentences(text)
    .filter((sentence) => !isNoiseSentence(sentence))
    .filter((sentence) => isProjectEvidence(sentence) || sentence.startsWith("技能"))
    .join("\n");

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function analyzeJobFit(jd: string, resume: string): AnalysisResult {
  const combined = `${jd}\n${resume}`;
  const evidenceCorpus = getEvidenceCorpus(resume);

  const skillScores: SkillScore[] = rules.map((rule) => {
    const resumeEvidence = findEvidence(resume, rule.keywords, rule.strongSignals, 4);
    const jdDemand = findEvidence(jd, rule.keywords, rule.strongSignals, 2);
    const keywordHits = rule.keywords.filter((keyword) => evidenceCorpus.toLowerCase().includes(keyword.toLowerCase())).length;
    const strongHits = rule.strongSignals.filter((keyword) => evidenceCorpus.toLowerCase().includes(keyword.toLowerCase())).length;
    const score = clamp(Math.round(22 + keywordHits * 7 + strongHits * 9 + resumeEvidence.length * 6), 18, 95);
    const gaps = rule.gapHints.filter((hint) => !includesAny(evidenceCorpus, hint.split(/和|或|、/))).slice(0, 3);

    return {
      key: rule.key,
      label: rule.label,
      score,
      evidence: resumeEvidence.length ? resumeEvidence : jdDemand,
      gaps: gaps.length ? gaps : rule.gapHints.slice(0, 2)
    };
  });

  const requirementMatches: RequirementMatch[] = requirementRules.map((rule) => {
    const evidence = findEvidence(resume, rule.keywords, rule.strongSignals, 1)[0];
    const weakSignal = includesAny(evidenceCorpus, rule.keywords);
    const strong = evidence && includesAny(evidence, rule.strongSignals);

    return {
      requirement: rule.requirement,
      level: strong ? "matched" : weakSignal ? "partial" : "missing",
      evidence: evidence || "简历中暂未看到可作为项目证据的直接描述",
      action: strong ? "证据质量较好，面试中继续补充目标、你的动作、结果指标和复盘。" : weakSignal ? rule.actionIfPartial : rule.actionIfMissing
    };
  });

  const totalScore = Math.round(skillScores.reduce((sum, item) => sum + item.score, 0) / skillScores.length);
  const resumeBullets = buildResumeBullets(skillScores, resume);
  const interviewQuestions = buildInterviewQuestions(jd);
  const projectPlan = buildProjectPlan(totalScore, skillScores);
  const badcases = buildBadcases(combined, skillScores);
  const summary = buildSummary(totalScore, skillScores);
  const exportMarkdown = buildMarkdown({
    totalScore,
    summary,
    skillScores,
    requirementMatches,
    resumeBullets,
    interviewQuestions,
    projectPlan,
    badcases
  });

  return {
    totalScore,
    summary,
    skillScores,
    requirementMatches,
    resumeBullets,
    interviewQuestions,
    projectPlan,
    badcases,
    exportMarkdown
  };
}

function buildSummary(totalScore: number, skillScores: SkillScore[]) {
  const strongest = [...skillScores].sort((a, b) => b.score - a.score)[0];
  const weakest = [...skillScores].sort((a, b) => a.score - b.score)[0];
  if (totalScore >= 78) {
    return `匹配度较高。当前优势是${strongest.label}，下一步要把${weakest.label}补成可展示证据。`;
  }
  if (totalScore >= 58) {
    return `具备投递基础，但证据还不够硬。建议优先补齐${weakest.label}，并把结果写进简历和作品集。`;
  }
  return "当前更像产品/AI兴趣者，需要尽快补一个完整项目闭环：场景、PRD、Demo、评测和复盘。";
}

function buildResumeBullets(skillScores: SkillScore[], resume: string) {
  const aiScore = skillScores.find((item) => item.key === "ai")?.score ?? 0;
  const dataScore = skillScores.find((item) => item.key === "data")?.score ?? 0;
  const hasCoze = /Coze|Dify|FastGPT|知识库|RAG/i.test(resume);

  return [
    `围绕AI产品经理实习岗位，拆解${hasCoze ? "知识库问答/Agent" : "AI求职助手"}场景，梳理用户任务链路、核心痛点、功能优先级与验收标准，输出PRD、流程图和原型方案。`,
    `使用${hasCoze ? "Coze/Dify类工具" : "AI工具"}搭建可演示MVP，覆盖资料上传、问题理解、结果生成与反馈记录等链路，沉淀Prompt模板和失败案例。`,
    `构建${dataScore >= 60 ? "指标看板" : "基础评测表"}，从命中率、可执行性、幻觉率和用户满意度维度复盘效果，定位Badcase并提出迭代策略。`,
    `持续跟踪LLM、RAG、Agent与多模态产品，完成竞品拆解和行业资料整理，将技术能力转化为${aiScore >= 65 ? "可落地产品方案" : "可执行学习计划"}。`
  ];
}

function buildInterviewQuestions(jd: string) {
  const questions = [
    "为什么你想做AI产品经理，而不是传统产品或算法研发？",
    "请讲一个你从0到1推进产品/项目的经历，重点讲需求判断和取舍。",
    "如果AI助手回答不稳定，你会如何定位问题并设计评测指标？",
    "RAG、Prompt优化、Fine-tuning、Agent分别适合解决什么问题？",
    "选择一个你常用的AI产品，拆解它的目标用户、核心链路、优点、缺点和下一步迭代。",
    "如果给企业员工做一个AI效率助手，你会如何从用户调研推进到上线？",
    "你如何判断一个AI功能是真需求，而不是炫技Demo？",
    "你最近关注的AI Agent产品或技术趋势是什么？它对产品经理有什么启发？"
  ];

  if (/智能硬件|眼镜|手机|汽车|家居|语音/.test(jd)) {
    questions.push("如果在手机/汽车/智能眼镜里做一个AI Agent，你会选择什么高频场景，为什么？");
  }
  if (/客服|知识库|运营/.test(jd)) {
    questions.push("AI客服场景里，如何区分知识缺失、意图理解错误和表达不清这三类问题？");
  }
  return questions;
}

function buildProjectPlan(totalScore: number, skillScores: SkillScore[]) {
  const weakest = [...skillScores].sort((a, b) => a.score - b.score)[0];
  return [
    `短期补证据：围绕${weakest.label}补一个可截图、可复盘的小交付，例如PRD、评测表、Demo录屏或竞品分析。`,
    "作品集增强：把项目拆成“问题定义、用户场景、方案设计、技术实现、评测指标、Badcase、迭代计划”七个模块。",
    "面试表达：为每个项目准备STAR版本，尤其讲清你自己的动作、取舍、推动过程和结果。",
    totalScore >= 70
      ? "投递策略：优先投与你现有项目方向最贴的岗位，再用一页纸定制化补充该JD关键词。"
      : "项目策略：先做一个AI求职Agent或知识库问答Agent的完整闭环，再投要求Builder能力强的岗位。",
    "长期能力：持续积累10个AI产品深度体验笔记，按场景、能力边界、指标和Badcase分类。"
  ];
}

function buildBadcases(text: string, skillScores: SkillScore[]) {
  const badcases = [
    "如果证据只来自标题、身份或技能列表，不能算强匹配，必须回到项目经历中找动作和结果。",
    "AI术语出现较多时，要继续追问：用在什么场景、解决什么问题、如何评估效果。",
    "简历项目只写职责，没有写用户、指标、取舍和迭代，产品思维证据不足。",
    "JD要求跨团队推进时，简历需要体现研发/设计/运营协作过程，而不是只写最终产物。",
    "作品集没有Demo、截图、评测表或复盘文档，可信度会下降。"
  ];

  if (!/SQL|Excel|Python|指标|数据|评测/.test(text)) {
    badcases.unshift("数据能力证据不足，建议补Excel/SQL分析或AI效果评测表。");
  }

  const weakest = [...skillScores].sort((a, b) => a.score - b.score)[0];
  badcases.unshift(`当前最需要人工复核的维度是：${weakest.label}。`);
  return badcases;
}

function buildMarkdown(result: Omit<AnalysisResult, "exportMarkdown">) {
  return `# AI求职Agent分析报告

## 总体匹配度
${result.totalScore}/100

${result.summary}

## 能力雷达
${result.skillScores.map((item) => `- ${item.label}: ${item.score}/100`).join("\n")}

## JD要求匹配
${result.requirementMatches
  .map((item) => `- ${item.requirement}: ${item.level}｜证据：${item.evidence}｜行动：${item.action}`)
  .join("\n")}

## 简历改写建议
${result.resumeBullets.map((item) => `- ${item}`).join("\n")}

## 面试题
${result.interviewQuestions.map((item, index) => `${index + 1}. ${item}`).join("\n")}

## 下一步项目计划
${result.projectPlan.map((item) => `- ${item}`).join("\n")}

## Badcase风险
${result.badcases.map((item) => `- ${item}`).join("\n")}
`;
}
