import { useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  Gauge,
  Github,
  Layers3,
  ListChecks,
  Plus,
  MessageSquareWarning,
  Play,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Wand2
} from "lucide-react";
import { analyzeJobFit, type AnalysisResult, type RequirementMatch } from "./lib/agent";
import {
  buildAiEnhancementGuide,
  evaluateAiEnhancementResult,
  requestAiEnhancement,
  type AiEnhancementResult
} from "./lib/aiEnhancer";
import { badcaseSamples, type BadcaseRecord } from "./data/badcaseSamples";
import { evaluationCases, type EvaluationCase } from "./data/evaluationCases";
import type { RetrievedKnowledge } from "./data/knowledgeBase";
import { fewShotExamples, professionalRubric } from "./data/professionalRubric";
import { sampleJd, sampleResume } from "./data/samples";

type TabKey = "match" | "dataset" | "badcase" | "ai" | "resume" | "interview" | "opensource";

const tabs: Array<{ key: TabKey; label: string; icon: typeof Target }> = [
  { key: "match", label: "匹配诊断", icon: Gauge },
  { key: "dataset", label: "样本评测", icon: Layers3 },
  { key: "badcase", label: "Badcase", icon: MessageSquareWarning },
  { key: "ai", label: "AI增强", icon: Sparkles },
  { key: "resume", label: "简历优化", icon: FileText },
  { key: "interview", label: "面试准备", icon: ClipboardCheck },
  { key: "opensource", label: "开源展示", icon: Github }
];

const levelLabel: Record<RequirementMatch["level"], string> = {
  matched: "强匹配",
  partial: "待增强",
  missing: "缺证据"
};

function App() {
  const [jd, setJd] = useState(sampleJd);
  const [resume, setResume] = useState(sampleResume);
  const [targetRole, setTargetRole] = useState("AI Agent / AI产品经理实习生");
  const [activeTab, setActiveTab] = useState<TabKey>("match");
  const [analysis, setAnalysis] = useState<AnalysisResult>(() => analyzeJobFit(sampleJd, sampleResume));
  const [aiResult, setAiResult] = useState<AiEnhancementResult | null>(null);
  const [lastRun, setLastRun] = useState("样例分析");
  const [badcaseRecords, setBadcaseRecords] = useState<BadcaseRecord[]>(() => {
    try {
      const saved = window.localStorage.getItem("ai-job-agent-badcases");
      return saved ? [...badcaseSamples, ...JSON.parse(saved)] : badcaseSamples;
    } catch {
      return badcaseSamples;
    }
  });

  const strongestSkill = useMemo(
    () => [...analysis.skillScores].sort((a, b) => b.score - a.score)[0],
    [analysis]
  );
  const weakestSkill = useMemo(
    () => [...analysis.skillScores].sort((a, b) => a.score - b.score)[0],
    [analysis]
  );
  const aiGuide = useMemo(() => buildAiEnhancementGuide(jd, resume, analysis), [jd, resume, analysis]);

  function runAgent() {
    setAnalysis(analyzeJobFit(jd, resume));
    setAiResult(null);
    setLastRun(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
  }

  function resetSamples() {
    setJd(sampleJd);
    setResume(sampleResume);
    setTargetRole("AI Agent / AI产品经理实习生");
    setAnalysis(analyzeJobFit(sampleJd, sampleResume));
    setAiResult(null);
    setLastRun("样例分析");
  }

  function loadEvaluationCase(item: EvaluationCase) {
    setTargetRole(item.title);
    setJd(item.jd);
    setResume(item.resume);
    setAnalysis(analyzeJobFit(item.jd, item.resume));
    setAiResult(null);
    setLastRun(`样本：${item.id}`);
    setActiveTab("match");
  }

  function downloadReport() {
    const blob = new Blob([analysis.exportMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-job-agent-report.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  function addBadcase(record: BadcaseRecord) {
    const nextRecords = [record, ...badcaseRecords];
    setBadcaseRecords(nextRecords);
    const customRecords = nextRecords.filter((item) => item.id.startsWith("USER-"));
    window.localStorage.setItem("ai-job-agent-badcases", JSON.stringify(customRecords));
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">AI Product Portfolio</p>
            <h1>AI 求职 Agent</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" onClick={resetSamples} aria-label="恢复样例">
              <RefreshCcw size={18} />
            </button>
            <button className="primary-button" onClick={runAgent}>
              <Play size={18} />
              运行分析
            </button>
          </div>
        </header>

        <section className="input-grid">
          <div className="input-panel">
            <label htmlFor="target-role">目标岗位</label>
            <input id="target-role" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} />
          </div>
          <div className="input-panel tall">
            <label htmlFor="jd">岗位 JD</label>
            <textarea id="jd" value={jd} onChange={(event) => setJd(event.target.value)} />
          </div>
          <div className="input-panel tall">
            <label htmlFor="resume">当前简历/经历</label>
            <textarea id="resume" value={resume} onChange={(event) => setResume(event.target.value)} />
          </div>
        </section>

        <nav className="tabs" aria-label="分析结果">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                className={activeTab === tab.key ? "tab active" : "tab"}
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon size={17} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <section className="results-area">
          {activeTab === "match" && (
            <MatchPanel analysis={analysis} aiResult={aiResult} strongest={strongestSkill.label} weakest={weakestSkill.label} lastRun={lastRun} />
          )}
          {activeTab === "dataset" && <DatasetPanel cases={evaluationCases} onLoad={loadEvaluationCase} />}
          {activeTab === "badcase" && <BadcasePanel records={badcaseRecords} lastRun={lastRun} onAdd={addBadcase} />}
          {activeTab === "ai" && (
            <AiPanel
              jd={jd}
              resume={resume}
              analysis={analysis}
              prompt={aiGuide.prompt}
              safetyNotes={aiGuide.safetyNotes}
              nextApiSteps={aiGuide.nextApiSteps}
              productGoal={aiGuide.productGoal}
              retrievedKnowledge={aiGuide.retrievedKnowledge}
              result={aiResult}
              onResult={setAiResult}
            />
          )}
          {activeTab === "resume" && <ResumePanel analysis={analysis} aiResult={aiResult} targetRole={targetRole} />}
          {activeTab === "interview" && <InterviewPanel analysis={analysis} />}
          {activeTab === "opensource" && <OpenSourcePanel analysis={analysis} onDownload={downloadReport} />}
        </section>
      </section>
    </main>
  );
}

function BadcasePanel({
  records,
  lastRun,
  onAdd
}: {
  records: BadcaseRecord[];
  lastRun: string;
  onAdd: (record: BadcaseRecord) => void;
}) {
  const [form, setForm] = useState({
    type: "误判" as BadcaseRecord["type"],
    symptom: "",
    rootCause: "",
    fixPlan: "",
    verification: ""
  });

  const statusSummary = records.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submitFeedback() {
    if (!form.symptom.trim()) return;
    const record: BadcaseRecord = {
      id: `USER-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      sample: lastRun,
      type: form.type,
      status: "待修复",
      symptom: form.symptom.trim(),
      rootCause: form.rootCause.trim() || "待分析",
      fixPlan: form.fixPlan.trim() || "待制定",
      verification: form.verification.trim() || "待复测"
    };
    onAdd(record);
    setForm({
      type: "误判",
      symptom: "",
      rootCause: "",
      fixPlan: "",
      verification: ""
    });
  }

  function downloadBadcasesJson() {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-job-agent-badcases.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadIssueMarkdown() {
    const markdown = buildIssueMarkdown(records);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "badcase-issue.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="panel-stack">
      <section className="table-panel">
        <div className="section-head">
          <MessageSquareWarning size={19} />
          <h2>Badcase 看板</h2>
        </div>
        <p className="panel-note">
          用来记录“判断不准、建议过泛、漏判、隐私风险、幻觉风险”。这是AI产品迭代里最重要的资产：每个Badcase都要有现象、根因、修复方案和验证方式。
        </p>
        <div className="badcase-summary">
          {["待修复", "观察中", "已修复"].map((status) => (
            <div className="summary-card" key={status}>
              <span>{statusSummary[status] ?? 0}</span>
              <p>{status}</p>
            </div>
          ))}
        </div>
        <div className="export-actions">
          <button className="secondary-button compact" onClick={downloadBadcasesJson}>
            <Download size={17} />
            导出 JSON
          </button>
          <button className="secondary-button compact" onClick={downloadIssueMarkdown}>
            <Github size={17} />
            生成 Issue
          </button>
        </div>
      </section>

      <section className="table-panel">
        <div className="section-head">
          <Plus size={19} />
          <h2>记录反馈</h2>
        </div>
        <div className="feedback-form">
          <label>
            类型
            <select value={form.type} onChange={(event) => updateField("type", event.target.value)}>
              <option>误判</option>
              <option>建议过泛</option>
              <option>漏判</option>
              <option>隐私风险</option>
              <option>幻觉风险</option>
            </select>
          </label>
          <label>
            现象
            <textarea
              value={form.symptom}
              onChange={(event) => updateField("symptom", event.target.value)}
              placeholder="例如：系统把身份标题当作AI能力证据。"
            />
          </label>
          <label>
            根因
            <input value={form.rootCause} onChange={(event) => updateField("rootCause", event.target.value)} placeholder="可先写待分析" />
          </label>
          <label>
            修复方案
            <input value={form.fixPlan} onChange={(event) => updateField("fixPlan", event.target.value)} placeholder="可先写待制定" />
          </label>
          <label>
            验证方式
            <input value={form.verification} onChange={(event) => updateField("verification", event.target.value)} placeholder="例如：重新运行该样本并检查证据来源" />
          </label>
          <button className="primary-button form-submit" onClick={submitFeedback} disabled={!form.symptom.trim()}>
            <Plus size={17} />
            新增 Badcase
          </button>
        </div>
      </section>

      <section className="badcase-list">
        {records.map((item) => (
          <article className="badcase-card" key={item.id}>
            <div className="badcase-head">
              <div>
                <span className={`status-pill ${item.status === "已修复" ? "fixed" : item.status === "观察中" ? "watching" : "todo"}`}>
                  {item.status}
                </span>
                <h3>{item.id}｜{item.type}</h3>
              </div>
              <small>{item.date}</small>
            </div>
            <p><strong>样本：</strong>{item.sample}</p>
            <p><strong>现象：</strong>{item.symptom}</p>
            <p><strong>根因：</strong>{item.rootCause}</p>
            <p><strong>修复：</strong>{item.fixPlan}</p>
            <p><strong>验证：</strong>{item.verification}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function buildIssueMarkdown(records: BadcaseRecord[]) {
  const pending = records.filter((item) => item.status !== "已修复");
  const source = pending.length ? pending : records;
  return `# AI求职Agent Badcase反馈

## 概览

- 待提交数量：${source.length}
- 生成时间：${new Date().toLocaleString("zh-CN")}

## Badcase列表

${source
  .map(
    (item) => `### ${item.id}｜${item.type}｜${item.status}

**样本**：${item.sample}

**现象**：${item.symptom}

**根因**：${item.rootCause}

**修复方案**：${item.fixPlan}

**验证方式**：${item.verification}
`
  )
  .join("\n")}

## 期望

请协助判断这些Badcase是否成立，并讨论是否需要调整规则、提示词、评测指标或交互设计。
`;
}

function DatasetPanel({ cases, onLoad }: { cases: EvaluationCase[]; onLoad: (item: EvaluationCase) => void }) {
  return (
    <section className="table-panel">
      <div className="section-head">
        <Layers3 size={19} />
        <h2>JD 样本评测集</h2>
      </div>
      <p className="panel-note">
        这些样本来自你提供的AI产品实习JD截图，并配套脱敏合成项目经历。点击载入后，可用于测试当前Agent是否误判、漏判或建议过泛。
      </p>
      <div className="dataset-grid">
        {cases.map((item) => (
          <article className="dataset-card" key={item.id}>
            <span>{item.direction}</span>
            <h3>{item.title}</h3>
            <p>{item.sourceNote}</p>
            <button className="secondary-button compact" onClick={() => onLoad(item)}>
              <Play size={16} />
              载入并分析
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function MatchPanel({
  analysis,
  aiResult,
  strongest,
  weakest,
  lastRun
}: {
  analysis: AnalysisResult;
  aiResult: AiEnhancementResult | null;
  strongest: string;
  weakest: string;
  lastRun: string;
}) {
  const requirementMatches = aiResult?.requirementMatches?.length ? aiResult.requirementMatches : analysis.requirementMatches;
  const sourceLabel = aiResult?.requirementMatches?.length ? "AI复核" : "规则引擎";

  return (
    <div className="panel-stack">
      <section className="score-strip">
        <div className="score-meter" style={{ "--score": `${analysis.totalScore}%` } as React.CSSProperties}>
          <span>{analysis.totalScore}</span>
          <small>/100</small>
        </div>
        <div className="score-copy">
          <div className="inline-meta">
            <Sparkles size={16} />
            <span>{lastRun}</span>
          </div>
          <h2>{analysis.summary}</h2>
          <p>优势：{strongest}。优先补强：{weakest}。</p>
        </div>
      </section>

      <section className="metric-grid">
        {analysis.skillScores.map((skill) => (
          <article className="metric-card" key={skill.key}>
            <div className="metric-head">
              <span>{skill.label}</span>
              <strong>{skill.score}</strong>
            </div>
            <div className="bar">
              <span style={{ width: `${skill.score}%` }} />
            </div>
            <p>{skill.evidence[0] || skill.gaps[0]}</p>
          </article>
        ))}
      </section>

      <section className="table-panel">
        <div className="section-head">
          <Target size={19} />
          <h2>JD 要求匹配</h2>
          <span className="source-badge">{sourceLabel}</span>
        </div>
        <div className="requirement-list">
          {requirementMatches.map((item) => (
            <article className={`requirement ${item.level}`} key={item.requirement}>
              <div>
                <span className="status-pill">{levelLabel[item.level]}</span>
                <h3>{item.requirement}</h3>
              </div>
              <p>{item.evidence}</p>
              <small>{item.action}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function AiPanel({
  jd,
  resume,
  analysis,
  productGoal,
  prompt,
  safetyNotes,
  nextApiSteps,
  retrievedKnowledge,
  result,
  onResult
}: {
  jd: string;
  resume: string;
  analysis: AnalysisResult;
  productGoal: string;
  prompt: string;
  safetyNotes: string[];
  nextApiSteps: string[];
  retrievedKnowledge: RetrievedKnowledge[];
  result: AiEnhancementResult | null;
  onResult: (result: AiEnhancementResult) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const qualityChecks = useMemo(
    () => (result ? evaluateAiEnhancementResult(result, jd, resume, analysis) : []),
    [analysis, jd, result, resume]
  );

  async function runAiEnhancement() {
    setIsLoading(true);
    setError("");
    try {
      const nextResult = await requestAiEnhancement({ jd, resume, analysis, prompt });
      onResult(nextResult);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "AI增强请求失败。");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="two-column">
      <section className="table-panel">
        <div className="section-head">
          <Sparkles size={19} />
          <h2>AI 增强策略</h2>
        </div>
        <p className="panel-note">{productGoal}</p>
        <div className="risk-list">
          {nextApiSteps.map((step, index) => (
            <div className="risk-item" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
        <button className="primary-button ai-action" onClick={runAiEnhancement} disabled={isLoading}>
          <Sparkles size={17} />
          {isLoading ? "正在生成..." : "生成AI增强建议"}
        </button>
        {error && (
          <div className="inline-alert">
            <MessageSquareWarning size={17} />
            <p>{error}</p>
          </div>
        )}
        {result && (
          <div className="ai-preview">
            <span>已收到模型结果</span>
            <p>{result.roleProfile}</p>
          </div>
        )}
      </section>

      {result && (
        <section className="table-panel full-width">
          <div className="section-head">
            <Sparkles size={19} />
            <h2>模型增强结果</h2>
          </div>
          <p className="ai-profile">{result.roleProfile}</p>
          <div className="quality-grid">
            {qualityChecks.map((item) => (
              <article className={`quality-card ${item.status === "通过" ? "pass" : item.status === "需复核" ? "review" : "risk"}`} key={item.label}>
                <div className="quality-head">
                  <span>{item.label}</span>
                  <strong>{item.score}</strong>
                </div>
                <div className="bar">
                  <span style={{ width: `${item.score}%` }} />
                </div>
                <small>{item.status}</small>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
          <div className="ai-result-grid">
            <AiResultCard title="匹配优势" items={result.advantages} />
            <AiResultCard
              title="JD匹配复核"
              items={result.requirementMatches.map(
                (item) => `${levelLabel[item.level]}｜${item.requirement}：${item.evidence}；${item.action}`
              )}
            />
            <AiResultCard title="缺口优先级" items={result.gapPriorities} />
            <AiResultCard title="简历Bullet" items={result.resumeBullets} />
            <AiResultCard title="面试追问" items={result.interviewQuestions} />
            <AiResultCard title="7天补强计划" items={result.sevenDayPlan} />
            <AiResultCard title="Badcase风险" items={result.badcaseRisks} />
            <AiResultCard title="知识引用" items={result.knowledgeCitations ?? []} />
          </div>
          {result.raw && (
            <details className="raw-output">
              <summary>查看原始输出</summary>
              <pre>{result.raw}</pre>
            </details>
          )}
        </section>
      )}

      <section className="table-panel full-width">
        <div className="section-head">
          <Layers3 size={19} />
          <h2>RAG 检索参考</h2>
        </div>
        <p className="panel-note">
          系统会根据当前JD、简历和规则分析，从本地知识库中检索最相关的岗位标准、简历方法、面试经验和评测方法，再注入模型上下文。
        </p>
        <div className="knowledge-grid">
          {retrievedKnowledge.length ? (
            retrievedKnowledge.map((item) => (
              <article className="knowledge-card" key={item.id}>
                <div className="knowledge-head">
                  <span>{item.id}</span>
                  <small>{item.category}</small>
                </div>
                <h3>{item.title}</h3>
                <p>{item.content}</p>
                <small>命中：{item.matchedTags.length ? item.matchedTags.join("、") : "语义相关"}｜得分 {item.score}</small>
              </article>
            ))
          ) : (
            <article className="knowledge-card">
              <h3>暂无高相关知识片段</h3>
              <p>当前输入未命中本地知识库关键词，模型会退回到JD、简历、Rubric和Few-shot进行判断。</p>
            </article>
          )}
        </div>
      </section>

      <section className="table-panel code-panel">
        <div className="section-head">
          <Wand2 size={19} />
          <h2>可复制 Prompt</h2>
        </div>
        <pre>{prompt}</pre>
      </section>

      <section className="table-panel full-width">
        <div className="section-head">
          <ClipboardCheck size={19} />
          <h2>专业评估 Rubric</h2>
        </div>
        <div className="rubric-grid">
          {professionalRubric.map((item) => (
            <article className="rubric-card" key={item.key}>
              <div className="rubric-head">
                <h3>{item.label}</h3>
                <span>{item.weight}%</span>
              </div>
              <p>{item.definition}</p>
              <small>强证据：{item.strongEvidence.slice(0, 2).join("、")}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="table-panel full-width">
        <div className="section-head">
          <BookOpen size={19} />
          <h2>Few-shot 判断样例</h2>
        </div>
        <div className="fewshot-grid">
          {fewShotExamples.map((item) => (
            <article className="fewshot-card" key={item.id}>
              <span>{item.id}</span>
              <h3>{item.title}</h3>
              <p><strong>错误：</strong>{item.badJudgement}</p>
              <p><strong>正确：</strong>{item.goodJudgement}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="table-panel full-width">
        <div className="section-head">
          <ShieldCheck size={19} />
          <h2>隐私与开源边界</h2>
        </div>
        <div className="checklist">
          {safetyNotes.map((note) => (
            <p key={note}>
              <CheckCircle2 size={17} />
              {note}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}

function AiResultCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="ai-result-card">
      <h3>{title}</h3>
      {items.length ? (
        <ol>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      ) : (
        <p>暂无明确结果，请结合Prompt原文人工判断。</p>
      )}
    </article>
  );
}

function ResumePanel({
  analysis,
  aiResult,
  targetRole
}: {
  analysis: AnalysisResult;
  aiResult: AiEnhancementResult | null;
  targetRole: string;
}) {
  const resumeBullets = aiResult?.resumeBullets?.length ? aiResult.resumeBullets : analysis.resumeBullets;
  const badcaseRisks = aiResult?.badcaseRisks?.length ? aiResult.badcaseRisks : analysis.badcases;
  const sourceLabel = aiResult ? "AI复核" : "规则引擎";

  return (
    <div className="two-column">
      <section className="table-panel">
        <div className="section-head">
          <Wand2 size={19} />
          <h2>{targetRole} 简历 Bullet</h2>
          <span className="source-badge">{sourceLabel}</span>
        </div>
        <div className="copy-list">
          {resumeBullets.map((bullet) => (
            <div className="copy-item" key={bullet}>
              <CheckCircle2 size={18} />
              <p>{bullet}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="table-panel">
        <div className="section-head">
          <BarChart3 size={19} />
          <h2>Badcase 风险</h2>
          <span className="source-badge">{sourceLabel}</span>
        </div>
        <div className="risk-list">
          {badcaseRisks.map((badcase, index) => (
            <div className="risk-item" key={badcase}>
              <span>{index + 1}</span>
              <p>{badcase}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function InterviewPanel({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="two-column">
      <section className="table-panel">
        <div className="section-head">
          <BookOpen size={19} />
          <h2>高频追问</h2>
        </div>
        <ol className="question-list">
          {analysis.interviewQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ol>
      </section>

      <section className="table-panel">
        <div className="section-head">
          <ListChecks size={19} />
          <h2>项目补强路线</h2>
        </div>
        <div className="timeline">
          {analysis.projectPlan.map((item, index) => (
            <div className="timeline-item" key={item}>
              <span>{index + 1}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function OpenSourcePanel({ analysis, onDownload }: { analysis: AnalysisResult; onDownload: () => void }) {
  return (
    <div className="two-column">
      <section className="table-panel">
        <div className="section-head">
          <Github size={19} />
          <h2>开源清单</h2>
        </div>
        <div className="checklist">
          <p><CheckCircle2 size={17} />README：产品背景、用户、功能、技术架构、Roadmap</p>
          <p><CheckCircle2 size={17} />样例数据：JD、简历、分析报告，避免暴露隐私</p>
          <p><CheckCircle2 size={17} />评测表：需求命中、幻觉、建议可执行性、面试题质量</p>
          <p><CheckCircle2 size={17} />博客结构：问题定义、产品方案、技术拆解、结果复盘</p>
        </div>
        <button className="secondary-button" onClick={onDownload}>
          <Download size={17} />
          导出 Markdown 报告
        </button>
      </section>

      <section className="table-panel code-panel">
        <div className="section-head">
          <FileText size={19} />
          <h2>报告预览</h2>
        </div>
        <pre>{analysis.exportMarkdown}</pre>
      </section>
    </div>
  );
}

export default App;
