# 白帆AI智能体克隆体

> 基于阿里云通义千问(qwen-plus)的白帆个人AI克隆体，模拟白帆的语气、知识和风格与人对话。

## 快速部署

### 方式一：Railway（推荐，免费额度够用）

1. 点击按钮一键部署：
   [![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/template?referrer=bairui-rong-agent)

2. 在 Railway 中添加环境变量：
   - `DASHSCOPE_API_KEY` = 你的阿里云 DashScope API Key
   - `PORT` = 3001

3. 等待部署完成，获得专属链接

### 方式二：本地运行

```bash
npm install
npm start
# 访问 http://localhost:3001
```

### 方式三：Docker

```bash
docker compose up -d
# 访问 http://localhost:3001
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/chat | 对话（发送 message 字段） |
| GET | /api/profile | 白帆个人资料 |
| GET | /api/knowledge | 知识库概览 |
| GET | /api/faqs | 常见问题 |
| GET | /api/scripts | 话术模板 |
| POST | /api/compliance-check | 合规检测 |

## 功能特性

- 完整知识库：白帆生平、职业经历、核心竞争力、荣誉资质
- 阿里云通义千问集成：qwen-plus 模型，回复拟人化
- 合规检测：自动检查违规用语
- 多页面 Web 界面：聊天、知识库浏览、工具
- 本地优先：知识库数据本地存储，无需外部依赖即可运行基础版

## 技术栈

- 后端：Node.js + Express
- AI：阿里云 DashScope (qwen-plus)
- 前端：原生 HTML/CSS/JS
- 部署：Railway / Docker / 任意 Node.js 主机

## License

MIT
