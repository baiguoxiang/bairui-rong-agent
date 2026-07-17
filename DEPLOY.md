# 白帆AI智能体 — 部署指南

## 快速启动（本地开发）

### 方式一：直接运行

`powershell
cd outputs\bairui-rong-agent-app
npm install
npm run dev
`

浏览器打开 http://localhost:3001

### 方式二：PowerShell 一键启动脚本

双击运行 start.bat 即可启动服务。

---

## 部署到服务器

### 方式一：Docker（推荐）

`powershell
# 构建镜像
docker build -t bairui-rong-agent .

# 运行容器
docker run -d -p 3001:3001 --name bairui-agent 
  -v C:\Users\Administrator\Documents\Codex\2026-07-16\ai/media:/app/media 
  --restart unless-stopped 
  bairui-rong-agent
`

或使用 docker-compose：

`powershell
docker compose up -d --build
`

### 方式二：裸机部署

`powershell
# 1. 安装 Node.js 20+
# 2. 上传项目到服务器
# 3. 安装依赖
npm install --production

# 4. 使用 PM2 守护进程
npm install -g pm2
pm2 start src/api/server.js --name bairui-agent
pm2 save
pm2 startup
`

---

## Nginx 反向代理配置

`
ginx
server {
    listen 80;
    server_name agent.pandora.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade ;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host System.Management.Automation.Internal.Host.InternalHost;
        proxy_cache_bypass ;
    }
}
`

---

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 3001 | 服务端口 |
| NODE_ENV | development | 环境 |

---

## API 文档

详见 README.md
