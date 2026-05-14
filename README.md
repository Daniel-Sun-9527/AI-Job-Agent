# AI 求职 Agent

AI 求职 Agent 是一个面向 AI 产品经理实习求职的开源作品集项目。它支持输入目标岗位 JD 和个人简历/经历，输出岗位匹配度、能力差距、简历改写建议、面试追问、Badcase 风险和可导出的 Markdown 报告。

## 为什么做这个项目

AI 产品经理岗位越来越看重候选人能否把一个 AI 场景做成完整产品闭环：

1. 理解用户和场景
2. 将需求转化为产品方案
3. 搭建或原型化 AI 工作流
4. 用数据和 Badcase 评估质量
5. 持续迭代到真实可用

本项目围绕这条闭环设计。第一版使用本地规则引擎，保证无需 API Key 也能稳定演示；后续会以“规则引擎保底 + 大模型增强”的方式接入 AI 能力。

## 目标用户

正在申请 AI 产品经理、AI Agent 产品、AIGC 产品、智能硬件 AI 产品、AI 平台产品等岗位的学生和初级求职者。

## 当前功能

- JD 与简历输入
- 岗位匹配度评分
- 产品、AI、数据、Builder、交付、作品集表达六维能力诊断
- JD 要求逐项匹配和证据提示
- 简历 Bullet 改写建议，支持 AI 复核版
- AI 产品经理面试题生成
- Badcase 风险诊断
- Badcase 本地记录、JSON导出和GitHub Issue模板生成
- AI 增强 Prompt 生成
- 后端模型代理 `/api/enhance`，支持 OpenAI-compatible API
- AI增强结果结构化展示：岗位画像、优势、缺口、简历Bullet、面试追问、7天计划、Badcase风险
- AI复核层：由大模型复核 JD 要求匹配、简历 Bullet 和 Badcase 风险
- AI输出质检：结构完整性、证据扎根度、行动可执行性、幻觉风险控制
- 专业评估 Rubric 与 Few-shot 样例库，用于提升模型判断稳定性
- RAG 知识库雏形：检索岗位标准、简历方法、面试经验和评测方法并注入模型上下文
- Markdown 报告导出

## 产品设计原则

这个项目不是从“聊天机器人”出发，而是从求职任务出发：

- 用户目标：判断自己的简历是否适合某个 AI PM 岗位
- 核心决策：应该先补哪类能力证据
- 核心输出：证据、缺口、改写建议、面试准备、项目补强路线
- 评估标准：建议是否具体、可执行、和 JD 对齐

## 技术栈

- React
- TypeScript
- Vite
- Lucide Icons
- 本地规则型 Agent：`src/lib/agent.ts`
- AI 增强提示词与前端请求层：`src/lib/aiEnhancer.ts`
- 后端模型代理：`server/index.mjs`

## 本地运行

```bash
npm install
npm run dev
```

然后打开终端输出的本地地址，默认是 `http://127.0.0.1:5173`。

## AI增强配置

项目默认可以在没有模型 Key 的情况下运行，点击“生成AI增强建议”时会提示配置方式。需要真实调用模型时：

1. 复制 `.env.example` 为 `.env`
2. 填写模型服务配置

```bash
AI_API_KEY=your_api_key_here
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4.1-mini
AI_TIMEOUT_MS=30000
```

3. 重启本地服务

```bash
npm run dev
```

`AI_BASE_URL` 使用 OpenAI-compatible 协议，因此也可以替换为支持 Chat Completions 格式的其他模型服务。不要把真实 `.env` 文件提交到 GitHub。

## 构建

```bash
npm run build
```

## 适合怎么使用

如果你是求职者：

1. 粘贴目标岗位 JD；
2. 粘贴已经脱敏的简历或项目经历；
3. 先看规则引擎的匹配诊断；
4. 配置模型 Key 后生成 AI 复核结果；
5. 根据 Badcase 风险和 7 天计划补项目证据；
6. 导出 Markdown 报告，作为简历修改和面试准备材料。

如果你是贡献者：

- 可以提交脱敏 JD；
- 可以提交脱敏项目经历；
- 可以提交模型误判 Badcase；
- 可以补充 Rubric、Few-shot 或 RAG 知识片段。

详细贡献方式见 [贡献指南](docs/contributing.md)。

## 开源与隐私

这个项目可以公开分享，但请一定不要提交真实 `.env`、API Key 或未脱敏简历。

详细说明见 [安全与隐私说明](SECURITY.md)。

第一次上传 GitHub 可以看 [GitHub 上传指南](docs/github-upload-guide.md)。

如果你想写博客或发动态，可以参考 [开源发布文案](docs/launch-copy.md)。

## 路线图

- V0.1：规则型 Agent，完成 JD-简历匹配闭环
- V0.2：AI 增强 Prompt 与隐私边界设计
- V0.3：接入后端模型代理，支持 OpenAI-compatible API 或国内模型
- V0.4：建立多 JD、多简历评测集，记录准确性、幻觉率、可执行性
- V0.5：支持用户贡献脱敏 JD 样本和求职经验
- V1.0：成为面向 AI 产品求职者的开源求职训练工具

## 项目结构

```text
src/
  App.tsx              # 产品界面
  styles.css           # 响应式样式
  data/samples.ts      # 脱敏样例 JD 和简历
  data/knowledgeBase.ts # 本地 RAG 知识库与检索函数
  data/professionalRubric.ts # 专业评估标准与 Few-shot 样例
  lib/agent.ts         # 本地规则型 Agent
  lib/aiEnhancer.ts    # AI 增强 Prompt 与前端请求
server/
  index.mjs            # 后端模型代理，隐藏 API Key
docs/
  PRD.md               # 产品需求文档
  evaluation.md        # 评测与 Badcase 框架
  evaluation-dataset.md # 脱敏 JD 与项目经历评测样本
  badcase-board.md     # Badcase 看板说明
  professional-rubric.md # 专业评估 Rubric 与 Few-shot 样例库说明
  rag-knowledge-base.md # RAG 知识库雏形说明
  github-upload-guide.md # GitHub 新手上传指南
  launch-copy.md       # 开源发布文案
  contributing.md      # 贡献指南
  learning-log.md      # 项目式学习记录
  roadmap.md           # 迭代路线图
```

## 隐私说明

规则分析在本地完成。AI增强会把当前输入的 JD、简历和规则分析结果发送到你配置的模型服务，因此真实使用前应先对姓名、电话、邮箱、学校敏感信息、公司内部信息进行脱敏。项目通过后端代理读取 `AI_API_KEY`，避免在浏览器前端暴露密钥。

## License

MIT
