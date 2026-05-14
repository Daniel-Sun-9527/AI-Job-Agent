# GitHub 上传指南

这份指南写给第一次用 GitHub 的同学。你不用先理解 Git 的全部概念，按步骤做就行。

## 上传前先确认

不要上传这些东西：

- `.env`：里面有你的 API Key
- `node_modules`：依赖包，体积巨大
- `dist`：构建产物，暂时不需要上传
- 真实简历、真实电话、邮箱、微信、学校敏感信息

本项目已经写好了 `.gitignore`，用 GitHub Desktop 上传时会自动忽略这些文件。

## 推荐方式：GitHub Desktop

这是最适合新手的方式。

### 1. 注册 GitHub

打开 [https://github.com](https://github.com)，注册账号。

用户名建议用长期会用的英文名，比如：

```text
yourname-ai
yourname-pm
```

### 2. 安装 GitHub Desktop

打开 [https://desktop.github.com](https://desktop.github.com)，下载安装到电脑。

安装后用你的 GitHub 账号登录。

### 3. 添加本地项目

打开 GitHub Desktop：

1. 点击 `File`
2. 点击 `Add local repository`
3. 选择这个项目文件夹：

```text
C:\Users\86139\Documents\New project 3
```

如果它提示“不是一个 Git 仓库”，选择 `create a repository`。

### 4. 填写仓库信息

建议这样填：

```text
Name: ai-job-agent
Description: 一个面向 AI 产品经理实习求职的开源 Agent，支持 JD 匹配、简历优化、Badcase 分析、Rubric/Few-shot/RAG 增强。
Local path: C:\Users\86139\Documents\New project 3
License: MIT
Git ignore: Node
```

### 5. 第一次提交

左下角会看到很多文件变更。

在 Summary 里写：

```text
Initial release: AI job agent
```

点击 `Commit to main`。

### 6. 发布到 GitHub

点击右上角 `Publish repository`。

注意：

- 不要勾选 `Keep this code private`
- 确认仓库名是 `ai-job-agent`
- 点击 `Publish Repository`

完成后，你会得到一个 GitHub 链接，类似：

```text
https://github.com/你的用户名/ai-job-agent
```

## 仓库 About 区域怎么填

进入 GitHub 仓库主页，右侧有 `About`，点击齿轮。

Description：

```text
面向 AI 产品经理实习求职的开源 Agent：JD 匹配、简历优化、Badcase 分析、Rubric/Few-shot/RAG 增强。
```

Website 可以先空着。

Topics 建议填：

```text
ai-product-manager
job-search
resume
rag
agent
react
typescript
vite
prompt-engineering
career
```

## 上传后检查

打开仓库页面后，检查：

1. README 是否自动显示；
2. `.env` 是否没有出现在文件列表里；
3. `node_modules` 是否没有出现在文件列表里；
4. `docs` 文件夹是否存在；
5. `src/data/knowledgeBase.ts` 和 `src/data/professionalRubric.ts` 是否存在。

如果 `.env` 被上传了，立刻告诉我。需要马上删除，并去模型平台重置 API Key。

## 第一次发朋友圈/博客可以怎么说

可以先发得朴素一点：

```text
最近做了一个 AI 求职 Agent，小目标是帮 AI 产品经理实习求职者把 JD 和自己的经历对齐起来。

它不是简单聊天机器人，而是围绕求职任务做了几层东西：
- 本地规则引擎：先做可解释的 JD/简历匹配；
- 大模型复核：优化简历 Bullet、Badcase 风险和面试追问；
- Rubric + Few-shot：把 AI 产品岗的判断标准沉淀下来；
- RAG 知识库：让模型参考岗位标准、简历方法和评测方法；
- Badcase 看板：把误判变成后续迭代数据。

项目还很早期，但已经能跑通一个完整的 AI 产品闭环：需求分析 -> Agent 工作流 -> 模型增强 -> 评测 -> 开源文档。

GitHub：
你的仓库链接
```
