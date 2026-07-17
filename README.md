# 白帆AI智能体克隆体

白帆（Sugar Bai）的 AI 克隆体 Web 应用。基于潘多拉之礼知识库构建，使用阿里云通义千问（qwen-plus）驱动。

## 功能

- **对话界面** — 与"白帆AI"实时对话，模拟白帆的语气和知识
- **个人档案** — 履历、能力、荣誉、团队信息
- **知识库浏览** — 平台、客户、产品、话术、合规、品牌规范
- **工具箱** — 合规检查、FAQ速查、系统提示词下载

## 快速开始

### 本地开发

`powershell
cd bairui-rong-agent-app
npm install
# 设置 API Key
="你的API_Key"
npm run dev
`

浏览器打开 http://localhost:3001

---

## 部署到 Railway（免费，推荐）

### 步骤

1. 注册 Railway: https://railway.app
2. 将本项目推送到 GitHub
3. 在 Railway 点击 "New Project" → "Deploy from GitHub repo"
4. 选择此仓库
5. 在 Railway Dashboard 中添加环境变量:
   - DASHSCOPE_API_KEY = 你的阿里云 DashScope API Key
   - PORT = 3001
6. Railway 会自动部署，生成一个公网链接

### 分享链接

部署完成后，把 Railway 生成的链接（如 https://xxx.railway.app）分享给任何人，他们就能和"白帆AI"对话了。

---

## 获取 DashScope API Key

1. 访问阿里云百炼平台: https://bailian.console.aliyun.com/
2. 登录阿里云账号
3. 进入 "API Key" 管理页面
4. 创建一个新的 API Key
5. 将 Key 填入 Railway 的环境变量中

---

## 项目结构

`
bairui-rong-agent-app/
├── src/
│   ├── api/server.js          # Express API + 阿里云通义千问桥接
│   └── data/knowledge-base.js # 知识库数据
├── public/
│   ├── index.html             # Web 界面
│   ├── style.css              # 样式
│   └── app.js                 # 前端逻辑
├── Procfile                   # Railway 部署配置
├── railway.json               # Railway 配置
├── start.bat                  # Windows 一键启动
└── README.md
`

---

## 合规说明

所有对外表达遵循潘多拉合规红线：
- 不承诺收益
- 不夸大产品功效
- 不使用未验证数据

---

## 版本

v2.0 — 2026-07-17
AI模型: 阿里云通义千问 qwen-plus
