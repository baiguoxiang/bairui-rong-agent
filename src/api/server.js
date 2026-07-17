import express from "express";
import cors from "cors";
import {
  agentProfile, careerTimeline, coreCompetencies, honors, teamMembers,
  platformInfo, customerProfiles, customerPainPoints, coreSellingPoints,
  salesScripts, faqs, complianceRedLines, brandGuidelines, speakingStyle,
  decisionFramework, responseTemplates, workFlow, selfConstraints
} from "../data/knowledge-base.js";

const app = express();
const PORT = process.env.PORT || 3001;
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || "";
const DASHSCOPE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

function buildSystemPrompt() {
  const honorList = honors.map(h => h.category + ": " + h.items.join(", ")).join("\\n");
  const pillarList = platformInfo.pillars.map(p => p.name + ": " + p.items.join(", ")).join("\\n");
  const scriptList = salesScripts.map(s => "[" + s.trigger + "] " + s.script).join("\\n");

  return "你是白帆（Sugar Bai），潘多拉之礼发起人/CEO。你必须严格基于以下知识库回答，不要编造不存在的信息。\\n\\n" +
    "## 身份\\n" +
    "- 公司: 广东潘多拉之礼科技有限公司（2024年成立）\\n" +
    "- 定位: 女性AI轻创业赋能平台\\n" +
    "- 使命: 帮助3000万女性实现AI轻创业成功\\n" +
    "- 个人标签: OPC一人公司系统设计者、女性就业赋能推动者\\n\\n" +
    "## 履历\\n" + careerTimeline.map(c => c.year + ": " + c.event).join("\\n") + "\\n\\n" +
    "## 核心能力\\n" + coreCompetencies.map(c => c.name + ": " + c.desc).join("\\n") + "\\n\\n" +
    "## 荣誉\\n" + honorList + "\\n\\n" +
    "## 团队\\n" + teamMembers.map(t => t.name + " (" + t.role + "): " + t.desc).join("\\n") + "\\n\\n" +
    "## 潘多拉平台\\n" +
    "定位: " + platformInfo.positioning + "\\n" +
    "四大支柱:\\n" + pillarList + "\\n" +
    "延伸场景: " + platformInfo.extendedScenarios.join(", ") + "\\n\\n" +
    "## 客户画像\\n" + customerProfiles.map(c => "- " + c.segment + ": " + (c.examples ? c.examples.join(", ") : c.traits ? c.traits.join(", ") : "")).join("\\n") + "\\n\\n" +
    "## 客户痛点\\n" + customerPainPoints.map(p => "- " + p).join("\\n") + "\\n\\n" +
    "## 核心卖点\\n" + coreSellingPoints.map(s => "- " + s).join("\\n") + "\\n\\n" +
    "## 成交话术\\n" + scriptList + "\\n\\n" +
    "## 常见问题\\n" + faqs.map(f => "Q: " + f.q + "\\nA: " + f.a).join("\\n\\n") + "\\n\\n" +
    "## 品牌表达\\n" +
    "- 主表达: " + brandGuidelines.mainExpression + "\\n" +
    "- 核心词: " + brandGuidelines.keywords.join(", ") + "\\n" +
    "- 对政府: " + brandGuidelines.toGovernment + "\\n" +
    "- 对创业者: " + brandGuidelines.toEntrepreneurs + "\\n\\n" +
    "## 语气风格\\n" +
    "- 务实直接、温和坚定、数据导向、系统思维、接地气\\n" +
    "- 先说结论再说理由，用结构化表达，善用比喻\\n\\n" +
    "## 合规红线\\n" + complianceRedLines.map(r => "- " + r).join("\\n") + "\\n\\n" +
    "## 回答要求\\n" +
    "1. 始终以白帆的第一人称视角回答\\n" +
    "2. 只基于以上知识库内容回答，不要编造\\n" +
    "3. 如果知识库中没有相关信息，诚实告诉对方\\n" +
    "4. 涉及收益、功效等问题时严格遵守合规红线\\n" +
    "5. 回答简洁务实，避免空话套话";
}

// Call DashScope API (OpenAI compatible)
async function callDashScope(messages) {
  const payload = {
    model: "qwen-plus",
    messages: messages,
    max_tokens: 2000,
    temperature: 0.7
  };

  const body = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(body);

  const response = await fetch(DASHSCOPE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": "Bearer " + DASHSCOPE_API_KEY,
      "Content-Length": uint8Array.length.toString()
    },
    body: uint8Array
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error("DashScope error: " + response.status + " " + errText);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "请提供 message 字段" });
  }

  try {
    const sysPrompt = buildSystemPrompt();
    const messages = [
      { role: "system", content: sysPrompt },
      { role: "user", content: message }
    ];

    if (history && Array.isArray(history) && history.length > 0) {
      messages.splice(1, 0, ...history.slice(-6));
    }

    const reply = await callDashScope(messages);
    res.json({
      reply,
      timestamp: new Date().toISOString(),
      model: "qwen-plus (阿里云)"
    });
  } catch (err) {
    console.error("DashScope call failed:", err.message);
    const fallbackReply = generateFallbackResponse(message.trim());
    res.json({
      reply: fallbackReply,
      timestamp: new Date().toISOString(),
      model: "fallback"
    });
  }
});

function generateFallbackResponse(input) {
  const lower = input.toLowerCase();
  if (lower.includes("pan duo la") || lower.includes("什么") || lower.includes("介绍")) {
    return "潘多拉是一个女性AI轻创业赋能平台。简单说，我们用AI工具降低创业门槛，用真实的大健康和轻美业产品做场景，用7天陪跑帮你看清自己适不适合做、怎么做。";
  }
  return "我是白帆，潘多拉之礼发起人。你有什么想了解的吗？";
}

app.get("/api/knowledge", (req, res) => {
  res.json({ profile: agentProfile, career: careerTimeline, competencies: coreCompetencies, honors, team: teamMembers, platform: platformInfo, customers: customerProfiles, painPoints: customerPainPoints, sellingPoints: coreSellingPoints, scripts: salesScripts, faqs, compliance: complianceRedLines, brandGuidelines, speakingStyle, decisionFramework, responseTemplates, constraints: selfConstraints });
});

app.get("/api/system-prompt", (req, res) => {
  res.json({ prompt: buildSystemPrompt() });
});

app.get("/api/profile", (req, res) => {
  res.json({ profile: agentProfile, career: careerTimeline, competencies: coreCompetencies, honors: honors.map(h => h.items).flat(), team: teamMembers.map(t => ({ name: t.name, role: t.role })), platform: { name: platformInfo.name, positioning: platformInfo.positioning }, mission: agentProfile.mission });
});

app.get("/api/faqs", (req, res) => { res.json(faqs); });
app.get("/api/scripts", (req, res) => { res.json(salesScripts); });

app.post("/api/compliance-check", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "请提供 text 字段" });
  const violations = [];
  const redLineKeywords = ["保证赚钱", "承诺收益", "躺赚", "零风险", "永久分红", "保证上市", "保证融资", "投资回报", "治疗", "治愈", "疗效", "药效", "层级返利", "国家级背书", "专利", "准确率", "用户规模"];
  redLineKeywords.forEach(kw => { if (text.includes(kw)) violations.push({ keyword: kw, matched: true }); });
  res.json({ text, isClean: violations.length === 0, violations, redLines: complianceRedLines });
});

app.listen(PORT, () => {
  console.log("白帆AI智能体 API 运行在 http://localhost:" + PORT);
  console.log("AI模型: qwen-plus (阿里云 DashScope)");
  console.log("API Key: " + (DASHSCOPE_API_KEY ? DASHSCOPE_API_KEY.substring(0, 8) + "****" : "NOT SET"));
});
