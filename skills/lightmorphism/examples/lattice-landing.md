# Lightmorphism — Lattice 落地页（英文为主）测试提示词

按 lightmorphism 设计系统，为一款面向 Tech Lead 的 AI Coding 质量控制平台 **Lattice** 设计官网首页。卖点是"让 AI 写出的代码可审计、可回滚、可约束"，解决团队引入 AI 编码后代码风格漂移、上下文丢失、不符合内部规范的问题。

生成首页主区块，所有区块在同一页面内从上到下排列：

1. **Hero**
   - 标题：一句能体现"克制 / 工程感 / 可控"的英文 slogan，不超过 6 个词，全大写
   - 副标题：一句话说明产品做什么、给谁用
   - 主按钮："Start Free Trial"
   - 次级链接："Read the Spec"
   - Hero 角落叠 1—2 个小信息浮标，例如 *"Drift detected today · 14"*、*"Avg. PR review · 2.3 min"*

2. **三栏特性区**
   - **Style Lock** —— 把团队的 lint / formatter / 命名规则编译成 AI 必须遵守的硬约束
   - **Diff Trace** —— 每次 AI 改动自动生成可回滚的语义化提交节点
   - **Spec Drift Alarm** —— 当 AI 输出偏离团队 spec 时主动告警，而不是事后发现
   - 每栏一个图标 + 一个英文小标签 + 一段描述（至少两句、要有具体动作描述，禁止"高效便捷"这种空话）

3. **底部数据带**：三组数字 + 标签：`14.2k` engineers onboarded · `99.97%` style match rate · `2.3 min` mean review time

输出 React + Tailwind 单文件，可直接预览。

**这个用例重点测试**：渐变描边外壳、Canvas hero atmosphere 是否真的在动、light-glass 主按钮（不是黑底白字）、chips 是否叠压 hero、段间距 ≤80px。
