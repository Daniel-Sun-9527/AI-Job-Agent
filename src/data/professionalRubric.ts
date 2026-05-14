export type RubricLevel = {
  level: "强" | "中" | "弱";
  criteria: string;
};

export type ProfessionalRubricDimension = {
  key: string;
  label: string;
  weight: number;
  definition: string;
  strongEvidence: string[];
  weakEvidence: string[];
  levels: RubricLevel[];
};

export type FewShotExample = {
  id: string;
  title: string;
  scenario: string;
  jdRequirement: string;
  resumeEvidence: string;
  badJudgement: string;
  goodJudgement: string;
  principle: string;
};

export const professionalRubric: ProfessionalRubricDimension[] = [
  {
    key: "product_basics",
    label: "产品基本功",
    weight: 18,
    definition: "能否把岗位要求拆成用户、场景、痛点、功能、流程、验收标准和优先级。",
    strongEvidence: ["用户访谈/问卷/竞品分析", "PRD/原型/流程图/验收标准", "需求优先级和版本节奏"],
    weakEvidence: ["只写参与产品工作", "只列工具名", "没有用户、场景或决策依据"],
    levels: [
      { level: "强", criteria: "有清晰用户场景、需求拆解、方案设计、文档或原型产出，并能说明为什么这样设计。" },
      { level: "中", criteria: "有产品流程或文档经验，但用户洞察、优先级或验收标准不完整。" },
      { level: "弱", criteria: "只有兴趣或课程概念，没有可验证的产品产物。" }
    ]
  },
  {
    key: "ai_understanding",
    label: "AI应用理解",
    weight: 20,
    definition: "能否理解大模型、Agent、RAG、Prompt、Workflow、多模态等能力边界，并转化为产品方案。",
    strongEvidence: ["使用Agent/RAG/工作流搭建Demo", "记录模型失败案例并迭代", "能说明模型能力边界和评测方法"],
    weakEvidence: ["只写使用过ChatGPT", "只堆AI术语", "不能解释AI功能如何解决具体问题"],
    levels: [
      { level: "强", criteria: "有AI工具/Agent/RAG实践，能讲清场景、输入输出、失败模式、迭代方式。" },
      { level: "中", criteria: "熟悉AI工具并做过轻量尝试，但缺少系统化产品设计或评测。" },
      { level: "弱", criteria: "只有泛泛兴趣或工具体验，没有可落地方案。" }
    ]
  },
  {
    key: "data_evaluation",
    label: "数据与评测",
    weight: 17,
    definition: "能否定义指标、采集反馈、分析Badcase，并用数据驱动迭代。",
    strongEvidence: ["命中率/准确率/转化率/留存/满意度等指标", "Badcase分类和复盘", "上线后或测试后的数据分析"],
    weakEvidence: ["只说数据分析", "没有指标口径", "没有样本和结论"],
    levels: [
      { level: "强", criteria: "能定义指标、解释口径、基于数据或Badcase提出迭代方案。" },
      { level: "中", criteria: "有Excel/SQL/问卷或反馈整理经验，但指标和业务动作关联较弱。" },
      { level: "弱", criteria: "没有数据证据，只是主观描述效果好。" }
    ]
  },
  {
    key: "builder",
    label: "Builder能力",
    weight: 18,
    definition: "能否亲手搭Demo、调Prompt、用低代码/代码/AI Coding工具把想法做出来。",
    strongEvidence: ["独立搭建Demo或小工具", "使用Coze/Dify/Cursor/Claude Code/Codex等完成原型", "有截图、链接、GitHub或复盘文档"],
    weakEvidence: ["只参与讨论", "只说会使用工具", "没有可展示产物"],
    levels: [
      { level: "强", criteria: "能独立从0到1做出可演示Demo，并说明架构、约束和迭代。" },
      { level: "中", criteria: "能搭建轻量工作流或页面，但完整度、复盘或用户验证不足。" },
      { level: "弱", criteria: "没有动手产物，停留在想法或文档。" }
    ]
  },
  {
    key: "delivery",
    label: "落地推进",
    weight: 15,
    definition: "能否跨研发、设计、运营协作，推动从需求到上线、测试、复盘的闭环。",
    strongEvidence: ["版本节奏/任务拆解/协作对象", "测试验收/上线发布/问题跟踪", "推动资源协同"],
    weakEvidence: ["只写负责/参与", "看不出个人动作", "没有推进过程"],
    levels: [
      { level: "强", criteria: "能说清目标、角色、协作对象、推进动作、结果和复盘。" },
      { level: "中", criteria: "参与过项目推进，但个人贡献或结果不够明确。" },
      { level: "弱", criteria: "只有团队结果，没有个人动作和过程证据。" }
    ]
  },
  {
    key: "portfolio",
    label: "作品集表达",
    weight: 12,
    definition: "能否把项目包装成可展示、可复盘、可信任的作品集材料。",
    strongEvidence: ["README/PRD/截图/演示视频/评测表/复盘文章", "GitHub或博客链接", "清晰说明问题、方案、效果、限制"],
    weakEvidence: ["只有一句项目名", "没有截图和文档", "不能讲清为什么做和怎么验证"],
    levels: [
      { level: "强", criteria: "有完整公开材料，别人能理解项目价值、使用方式和迭代过程。" },
      { level: "中", criteria: "有部分材料，但缺少评测、复盘或展示包装。" },
      { level: "弱", criteria: "没有可查看作品，只能口头描述。" }
    ]
  }
];

export const fewShotExamples: FewShotExample[] = [
  {
    id: "FS-001",
    title: "AI工具使用不等于AI产品经验",
    scenario: "候选人写“熟练使用ChatGPT、Kimi、豆包”。",
    jdRequirement: "熟悉AI产品、Agent、Prompt工程，有AI工具实践经验。",
    resumeEvidence: "使用Kimi、豆包、ChatGPT整理课程资料，设计Prompt模板生成知识点总结和练习题。",
    badJudgement: "强匹配AI产品经验。",
    goodJudgement: "部分匹配。该经历能证明AI工具使用和Prompt意识，但还缺少产品目标、用户反馈、失败案例、评测指标和迭代结果。",
    principle: "不能把工具使用直接等同于AI产品经验，必须追问场景、用户、效果和迭代。"
  },
  {
    id: "FS-002",
    title: "项目标题不是能力证据",
    scenario: "简历出现“AI产品经理实习方向｜本科大三”。",
    jdRequirement: "具备AI产品/Agent项目经验。",
    resumeEvidence: "标题写了AI产品经理实习方向，但正文没有AI项目动作。",
    badJudgement: "强匹配AI应用理解。",
    goodJudgement: "缺证据。标题只能说明求职方向，不能证明AI产品能力，需要从项目经历中找动作、产物和结果。",
    principle: "身份、标题、技能列表不能单独作为强证据，必须回到项目动作。"
  },
  {
    id: "FS-003",
    title: "有产品动作但缺AI落地",
    scenario: "候选人做过二手交易小程序优化。",
    jdRequirement: "参与AI Agent产品功能设计和落地。",
    resumeEvidence: "访谈20名学生，绘制Axure原型，撰写需求文档，推动搜索筛选优化。",
    badJudgement: "强匹配AI Agent产品。",
    goodJudgement: "产品基本功强，但AI应用理解只部分匹配。该项目能证明需求分析和推进能力，不能直接证明Agent/RAG/Prompt能力。",
    principle: "传统产品经验可以迁移，但要明确迁移到AI场景还缺什么证据。"
  },
  {
    id: "FS-004",
    title: "没有指标不能编造结果",
    scenario: "候选人写“优化搜索体验”，但没有上线数据。",
    jdRequirement: "具备数据分析和上线后效果复盘能力。",
    resumeEvidence: "提出排序和标签优化方案，未提供转化率、点击率或满意度变化。",
    badJudgement: "改写为搜索转化率提升30%。",
    goodJudgement: "可写为“提出排序和标签优化方案，并设计点击率、跳出率、转化率看板作为后续验证指标”，不能编造已发生的提升。",
    principle: "简历优化允许补表达，不允许补事实；缺指标时应写待验证指标。"
  },
  {
    id: "FS-005",
    title: "Builder能力要看可展示产物",
    scenario: "候选人说“了解Coze/Dify”。",
    jdRequirement: "能通过AI工具写完整前后端Demo或搭建Agent工作流。",
    resumeEvidence: "体验Coze搭建课程问答机器人，接入课程文档作为知识库，记录回答不准确和引用缺失问题。",
    badJudgement: "强匹配Builder能力。",
    goodJudgement: "部分匹配。已有Agent工作流体验和Badcase意识，但如果没有可访问Demo、截图、配置说明或评测表，Builder证据仍不足。",
    principle: "Builder能力必须有可展示产物和复盘材料，不能只看工具名。"
  }
];

export function formatRubricForPrompt() {
  return professionalRubric
    .map(
      (item) => `【${item.label}｜权重${item.weight}%】
定义：${item.definition}
强证据：${item.strongEvidence.join("、")}
弱证据：${item.weakEvidence.join("、")}
分级：
${item.levels.map((level) => `- ${level.level}：${level.criteria}`).join("\n")}`
    )
    .join("\n\n");
}

export function formatFewShotsForPrompt() {
  return fewShotExamples
    .map(
      (item) => `【${item.id}｜${item.title}】
JD要求：${item.jdRequirement}
简历证据：${item.resumeEvidence}
错误判断：${item.badJudgement}
正确判断：${item.goodJudgement}
判断原则：${item.principle}`
    )
    .join("\n\n");
}
