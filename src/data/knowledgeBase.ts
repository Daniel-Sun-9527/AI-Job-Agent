export type KnowledgeChunk = {
  id: string;
  title: string;
  category: "岗位标准" | "简历方法" | "面试准备" | "AI产品方法" | "评测与Badcase" | "作品集";
  tags: string[];
  content: string;
};

export type RetrievedKnowledge = KnowledgeChunk & {
  score: number;
  matchedTags: string[];
};

export const knowledgeBase: KnowledgeChunk[] = [
  {
    id: "KB-001",
    title: "AI产品经理实习岗位核心画像",
    category: "岗位标准",
    tags: ["AI产品", "Agent", "需求分析", "PRD", "落地", "沟通"],
    content:
      "AI产品经理实习生通常不是单纯写文档，而是要把AI能力转化为可落地的功能：识别用户场景，拆解需求，设计交互和流程，协同算法/研发/设计，跟进测试上线，并基于反馈复盘。强证据应包含场景、用户、功能方案、协作过程和结果。"
  },
  {
    id: "KB-002",
    title: "Agent/RAG经历的强证据标准",
    category: "AI产品方法",
    tags: ["Agent", "RAG", "知识库", "Workflow", "Prompt", "评测"],
    content:
      "Agent或RAG项目不能只写搭建过工具。更强的表达应包含：知识来源、检索/调用链路、Prompt或工作流设计、失败案例、评测指标、迭代策略。若没有上线，可用Demo截图、流程图、样例问答、Badcase表和复盘文档补证据。"
  },
  {
    id: "KB-003",
    title: "AI产品简历Bullet结构",
    category: "简历方法",
    tags: ["简历", "Bullet", "STAR", "指标", "改写"],
    content:
      "AI产品简历Bullet建议采用：场景/用户 -> 问题 -> 行动 -> AI方法/工具 -> 结果/指标。不能编造结果；缺少真实数据时，可以写设计了哪些指标、如何验证、下一步如何采集，而不是虚构提升比例。"
  },
  {
    id: "KB-004",
    title: "数据与评测能力的证据",
    category: "评测与Badcase",
    tags: ["数据", "评测", "指标", "Badcase", "复盘", "上线"],
    content:
      "AI产品岗位看重评测思维。强证据包括指标口径、样本集、Badcase分类、人工复核、上线后数据和复盘。常见指标包括命中率、准确率、任务完成率、响应满意度、转化率、留存、问题解决率。没有数据时要说明如何设计评测表和采样方案。"
  },
  {
    id: "KB-005",
    title: "Builder能力如何证明",
    category: "作品集",
    tags: ["Builder", "Demo", "Coze", "Dify", "Cursor", "GitHub", "作品集"],
    content:
      "Builder能力要看可展示产物，而不是只看工具名。强证据包括可运行Demo、GitHub仓库、README、截图、演示视频、配置说明、功能边界、技术选型和复盘。AI PM不一定要像工程师一样深，但要能用工具把想法做成可验证原型。"
  },
  {
    id: "KB-006",
    title: "跨团队推进与落地表达",
    category: "岗位标准",
    tags: ["落地", "项目推进", "协作", "研发", "设计", "运营"],
    content:
      "落地推进不是写'参与项目'，而是要说明目标、角色、协作对象、关键冲突、推进动作和交付结果。AI产品尤其要说明如何把复杂技术约束翻译成研发可实现、设计可表达、运营可验证的方案。"
  },
  {
    id: "KB-007",
    title: "AI产品面试追问方向",
    category: "面试准备",
    tags: ["面试", "追问", "Agent", "产品判断", "复盘"],
    content:
      "AI产品面试常追问：为什么选择这个场景；用户痛点是否真实；Prompt或Agent链路如何设计；如何评估回答质量；失败案例如何分类；如果模型幻觉怎么办；如何制定MVP和迭代节奏；你个人做了什么而不是团队做了什么。"
  },
  {
    id: "KB-008",
    title: "避免过度拔高经历",
    category: "评测与Badcase",
    tags: ["幻觉", "证据", "误判", "简历", "Badcase"],
    content:
      "简历分析必须区分事实、推断和建议。事实来自简历原文；推断需要标注不确定；建议可以提出补证据动作。不能把'了解、体验、参与、感兴趣'直接写成'主导、上线、提升、增长'。"
  },
  {
    id: "KB-009",
    title: "AI硬件与智能设备产品关注点",
    category: "AI产品方法",
    tags: ["智能硬件", "语音", "多模态", "端侧AI", "场景"],
    content:
      "智能硬件或消费电子AI产品要关注多模态交互、端侧能力限制、响应速度、隐私、误触发、连续对话和真实场景体验。简历中如果没有硬件项目，可以强调用户场景分析、AI交互原型和竞品体验报告。"
  },
  {
    id: "KB-010",
    title: "开源作品集的可信展示",
    category: "作品集",
    tags: ["开源", "GitHub", "README", "博客", "PRD", "复盘"],
    content:
      "开源作品集应让陌生人快速理解：问题是什么、用户是谁、方案如何设计、技术如何实现、如何评测、有哪些Badcase、下一步怎么迭代。README、PRD、学习记录、截图、演示视频和评测样本都能提升可信度。"
  }
];

export function retrieveKnowledge(query: string, limit = 5): RetrievedKnowledge[] {
  const normalizedQuery = normalize(query);
  return knowledgeBase
    .map((chunk) => {
      const matchedTags = chunk.tags.filter((tag) => normalizedQuery.includes(normalize(tag)));
      const titleHit = normalizedQuery.includes(normalize(chunk.title)) ? 2 : 0;
      const contentTerms = chunk.content
        .split(/[，。；：、\s/]+/)
        .filter((term) => term.length >= 2)
        .filter((term) => normalizedQuery.includes(normalize(term)));
      const score = matchedTags.length * 5 + titleHit + Math.min(contentTerms.length, 8);
      return { ...chunk, score, matchedTags };
    })
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function formatRetrievedKnowledgeForPrompt(chunks: RetrievedKnowledge[]) {
  if (!chunks.length) return "未检索到明显相关知识片段，请严格基于JD、简历和Rubric判断。";
  return chunks
    .map(
      (chunk) => `【${chunk.id}｜${chunk.category}｜${chunk.title}】
相关标签：${chunk.matchedTags.length ? chunk.matchedTags.join("、") : chunk.tags.slice(0, 3).join("、")}
参考内容：${chunk.content}`
    )
    .join("\n\n");
}

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, "");
}
