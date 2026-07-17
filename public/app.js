const API_BASE = "";

// Tab switching
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    const tabId = btn.dataset.tab;
    document.getElementById(`tab-${tabId}`).classList.add("active");
    
    if (tabId === "profile") loadProfile();
    if (tabId === "knowledge") loadKnowledge("platform");
    if (tabId === "tools") loadTools();
  });
});

// Knowledge tabs
document.querySelectorAll(".k-tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".k-tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    loadKnowledge(btn.dataset.ktab);
  });
});

// Chat
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const chatMessages = document.getElementById("chatMessages");

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener("click", sendMessage);


async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  
  appendMessage("user", text);
  chatInput.value = "";
  chatInput.style.height = "auto";
  sendBtn.disabled = true;
  
  // Show loading indicator
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "message bot-message";
  loadingDiv.id = "loadingMsg";
  loadingDiv.innerHTML = `<div class="message-avatar">白</div>
    <div class="message-body">
      <span class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </span>
    </div>`;
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  try {
    const res = await fetch(API_BASE + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    
    // Remove loading
    const ld = document.getElementById("loadingMsg");
    if (ld) ld.remove();
    
    appendMessage("bot", data.reply);
    // Show model badge
    if (data.model) {
      const modelEl = document.createElement("div");
      modelEl.style.cssText = "font-size:10px;color:var(--text-muted);margin-top:4px;";
      modelEl.textContent = data.model === "fallback" ? "[本地知识库]" : "[AI模型: qwen-plus]";
      div.appendChild(modelEl);
    };
    // Show knowledge context
    if (data.context && data.context.length > 0) {
      const ctxEl = document.createElement("div");
      ctxEl.style.cssText = "font-size:11px;color:var(--text-muted);margin-top:4px;padding:4px 8px;background:rgba(108,92,231,0.1);border-radius:4px;display:inline-block;";
      ctxEl.textContent = "[参考]: " + data.context.join(", ");
      div.appendChild(ctxEl);
    };
  } catch (err) {
    const ld = document.getElementById("loadingMsg");
    if (ld) ld.remove();
    appendMessage("bot", "抱歉，暂时无法连接。请确保 API 服务已启动。");
  }
  
  sendBtn.disabled = false;
}

function appendMessage(type, text) {
  const div = document.createElement("div");
  div.className = `message ${type}-message`;
  
  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = type === "bot" ? "白" : "你";
  
  const body = document.createElement("div");
  body.className = "message-body";
  body.innerHTML = formatMessage(text);
  
  div.appendChild(avatar);
  div.appendChild(body);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}


function formatMessage(text) {
  // Split by double newline into paragraphs
  const paragraphs = text.split(/\n\n+/);
  let html = '';
  
  for (const para of paragraphs) {
    let line = para.trim();
    if (!line) continue;
    
    // Bold text
    line = line.replace(/\*\*(.+?)\*\*/g, '<strong></strong>');
    // Numbered list items
    line = line.replace(/^(\d+\..+)/gm, '<span style="margin-left:16px;display:block;font-weight:600;color:var(--accent);"></span>');
    // Bullet items
    line = line.replace(/^ - (.+)/gm, '<span style="margin-left:16px;display:block;">? </span>');
    // Single line breaks within paragraph
    line = line.replace(/\n/g, '<br>');
    
    html += '<p>' + line + '</p>';
  }
  
  return html;
}

// Auto-resize textarea
chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
});

// Load profile data
async function loadProfile() {
  try {
    const res = await fetch(`${API_BASE}/api/profile`);
    const data = await res.json();
    
    // Timeline
    const timelineEl = document.getElementById("timeline");
    timelineEl.innerHTML = data.career.map(c => 
      `<div class="timeline-item"><span class="timeline-year">${c.year}</span><span class="timeline-event">${c.event}</span></div>`
    ).join("");
    
    // Competencies
    const compEl = document.getElementById("competencies");
    compEl.innerHTML = data.competencies.map(c => 
      `<div class="competency-item"><div class="competency-name">${c.name}</div><div style="color:var(--text-muted);font-size:12px;">${c.desc}</div></div>`
    ).join("");
    
    // Honors
    const honorsEl = document.getElementById("honors");
    const res2 = await fetch(`${API_BASE}/api/knowledge`);
    const kb = await res2.json();
    honorsEl.innerHTML = kb.honors.map(h => 
      `<div class="honor-item"><div class="honor-category">${h.category}</div><div style="color:var(--text-muted);font-size:12px;">${h.items.join("、")}</div></div>`
    ).join("");
    
    // Team
    const teamEl = document.getElementById("team");
    teamEl.innerHTML = kb.team.map(t => 
      `<div class="team-member"><span class="team-name">${t.name}</span> <span class="team-role">(${t.role})</span><div style="color:var(--text-muted);font-size:12px;margin-top:2px;">${t.desc}</div></div>`
    ).join("");
  } catch (err) {
    console.error("Failed to load profile:", err);
  }
}

// Load knowledge base
async function loadKnowledge(tab) {
  const contentEl = document.getElementById("knowledgeContent");
  try {
    const res = await fetch(`${API_BASE}/api/knowledge`);
    const kb = await res.json();
    
    const contentMap = {
      platform: `
        <h3>平台定位</h3>
        <p>${kb.platform.positioning}</p>
        <h3>四大支柱</h3>
        <ul>${kb.platform.pillars.map(p => `<li><strong>${p.name}</strong>: ${p.items.join("、")}</li>`).join("")}</ul>
        <h3>延伸场景</h3>
        <p>${kb.extendedScenarios.join("、")}</p>
      `,
      customers: `
        <h3>客户画像</h3>
        ${kb.customers.map(c => `<p><strong>${c.segment}</strong></p><ul>${c.examples ? c.examples.map(e => `<li>${e}</li>`).join("") : ""}${c.traits ? c.traits.map(t => `<li>${t}</li>`).join("") : ""}</ul>`).join("")}
        <h3>客户痛点</h3>
        <ul>${kb.painPoints.map(p => `<li>${p}</li>`).join("")}</ul>
      `,
      products: `
        <h3>核心卖点</h3>
        <ul>${kb.sellingPoints.map(s => `<li>${s}</li>`).join("")}</ul>
        <h3>成交话术</h3>
        <ul>${kb.scripts.map(s => `<li><strong>[${s.trigger}]</strong> ${s.script}</li>`).join("")}</ul>
      `,
      scripts: `
        <h3>成交话术集</h3>
        <ul>${kb.scripts.map(s => `<li><strong>[${s.trigger}]</strong> ${s.script}</li>`).join("")}</ul>
        <h3>FAQ</h3>
        <ul>${kb.faqs.map(f => `<li><strong>Q:</strong> ${f.q}<br><strong>A:</strong> ${f.a}</li>`).join("")}</ul>
      `,
      compliance: `
        <h3>合规红线</h3>
        <ul>${kb.compliance.map(r => `<li>${r}</li>`).join("")}</ul>
        <h3>自我约束</h3>
        <ul>${kb.constraints.map(c => `<li>${c}</li>`).join("")}</ul>
      `,
      brand: `
        <h3>品牌表达规范</h3>
        <p><strong>主表达:</strong> ${kb.brandGuidelines.mainExpression}</p>
        <p><strong>核心词:</strong> ${kb.brandGuidelines.keywords.join("、")}</p>
        <p><strong>对政府:</strong> ${kb.brandGuidelines.toGovernment}</p>
        <p><strong>对创业者:</strong> ${kb.brandGuidelines.toEntrepreneurs}</p>
        <p><strong>对门店:</strong> ${kb.brandGuidelines.toStores}</p>
        <h3>语气风格</h3>
        <p><strong>基调:</strong> ${kb.speakingStyle.tone.join("、")}</p>
        <p><strong>表达模式:</strong></p>
        <ul>${kb.speakingStyle.patterns.map(p => `<li>${p}</li>`).join("")}</ul>
      `,
    };
    
    contentEl.innerHTML = contentMap[tab] || "<p>暂无内容</p>";
  } catch (err) {
    contentEl.innerHTML = "<p>加载失败，请确保 API 服务已启动。</p>";
  }
}

// Tools
async function loadTools() {
  try {
    const res = await fetch(`${API_BASE}/api/faqs`);
    const faqs = await res.json();
    document.getElementById("faqList").innerHTML = faqs.map(f => 
      `<div class="faq-item"><div class="faq-q">Q: ${f.q}</div><div class="faq-a">${f.a}</div></div>`
    ).join("");
  } catch (err) {
    console.error("Failed to load tools:", err);
  }
}

// Compliance check
async function checkCompliance() {
  const text = document.getElementById("complianceInput").value.trim();
  if (!text) return;
  
  try {
    const res = await fetch(`${API_BASE}/api/compliance-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    
    const resultEl = document.getElementById("complianceResult");
    if (data.isClean) {
      resultEl.innerHTML = `<div class="compliance-result compliance-clean">? 合规检查通过，未发现违规内容。</div>`;
    } else {
      const violations = data.violations.map(v => `<li>${v.keyword}</li>`).join("");
      resultEl.innerHTML = `<div class="compliance-result compliance-violation">?? 发现 ${data.violations.length} 处疑似违规：<ul>${violations}</ul></div>`;
    }
  } catch (err) {
    document.getElementById("complianceResult").innerHTML = "<p style=\"color:var(--danger);\">请求失败</p>";
  }
}

// Download system prompt
async function downloadPrompt() {
  try {
    const res = await fetch(`${API_BASE}/api/system-prompt`);
    const data = await res.json();
    
    const blob = new Blob([data.prompt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "白帆AI系统提示词.md";
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert("获取系统提示词失败");
  }
}

// Media upload
const uploadZone = document.getElementById("uploadZone");
const mediaUpload = document.getElementById("mediaUpload");

if (uploadZone) {
  uploadZone.addEventListener("click", () => mediaUpload.click());
  
  uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = "var(--primary)";
  });
  
  uploadZone.addEventListener("dragleave", () => {
    uploadZone.style.borderColor = "var(--border)";
  });
  
  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = "var(--border)";
    handleFiles(e.dataTransfer.files);
  });
  
  mediaUpload.addEventListener("change", () => {
    handleFiles(mediaUpload.files);
  });
}

function handleFiles(files) {
  if (files.length > 0) {
    const names = Array.from(files).map(f => f.name).join(", ");
    uploadZone.innerHTML = `
      <p style="color:var(--success);">? 已选择 ${files.length} 个文件</p>
      <p style="font-size:12px;color:var(--text-muted);margin-top:8px;">${names}</p>
      <p style="font-size:11px;color:var(--text-muted);margin-top:12px;">提示: 语音素材将用于增强克隆体的声音特征识别</p>
    `;
  }
}

// Initialize
loadKnowledge("platform");







