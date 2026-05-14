export type BadcaseType = "误判" | "建议过泛" | "漏判" | "隐私风险" | "幻觉风险";
export type BadcaseStatus = "待修复" | "已修复" | "观察中";

export type BadcaseRecord = {
  id: string;
  date: string;
  sample: string;
  type: BadcaseType;
  status: BadcaseStatus;
  symptom: string;
  rootCause: string;
  fixPlan: string;
  verification: string;
};

export const badcaseSamples: BadcaseRecord[] = [
  {
    id: "BC-001",
    date: "2026-05-14",
    sample: "样本评测：AI产品实习方向",
    type: "误判",
    status: "已修复",
    symptom: "系统把“候选人｜AI产品实习方向｜本科大三”当作AI应用理解证据，导致匹配结果混乱。",
    rootCause: "证据抽取只看关键词，没有区分身份标题、技能列表和项目动作。",
    fixPlan: "过滤候选人标题、教育经历、技能表头和项目标题；优先抽取包含动作词、工具和指标的项目句。",
    verification: "重新运行样本评测，检查能力卡片证据是否来自项目动作句。"
  },
  {
    id: "BC-002",
    date: "2026-05-14",
    sample: "样本评测：项目补强路线",
    type: "建议过泛",
    status: "已修复",
    symptom: "补强建议只围绕简历改写，不够宽。",
    rootCause: "项目计划生成逻辑只输出单一路径，缺少作品集、面试、投递和长期能力维度。",
    fixPlan: "将建议扩展为短期补证据、作品集增强、面试表达、投递策略和长期能力五类。",
    verification: "查看“面试准备-项目补强路线”，确认建议覆盖多个维度。"
  },
  {
    id: "BC-003",
    date: "2026-05-14",
    sample: "AI增强Prompt",
    type: "幻觉风险",
    status: "观察中",
    symptom: "后续接入大模型后，模型可能编造候选人没有做过的项目、指标或工具经历。",
    rootCause: "生成式模型倾向于补全缺失信息，如果Prompt没有约束证据来源，容易产生幻觉。",
    fixPlan: "要求模型逐条标注证据来源；输出中区分“已有证据”和“建议补充”，不允许自动编造结果。",
    verification: "接入模型后，用同一批样本检查是否出现虚构经历。"
  },
  {
    id: "BC-004",
    date: "2026-05-14",
    sample: "开源样例数据",
    type: "隐私风险",
    status: "观察中",
    symptom: "用户真实简历和真实JD可能包含姓名、学校、公司、手机号等隐私信息。",
    rootCause: "求职工具天然处理敏感文本，开源样例必须脱敏。",
    fixPlan: "保留合成样本；后续贡献指南中要求用户删除姓名、联系方式、学校细节和公司内部信息。",
    verification: "发布前人工检查README、样本数据和截图，确认没有真实隐私。"
  }
];
