# 项目部署指南

本指南将详细介绍如何部署这个 Next.js + Supabase + Stripe 项目到生产环境。

## 部署选项

### 1. Vercel (推荐)
Vercel 是 Next.js 官方推荐的部署平台，与 Next.js 深度集成，提供一键部署功能。

### 2. 其他平台
- Netlify
- AWS Amplify
- Google Cloud Run
- 自托管服务器

## 使用 Vercel 部署 (推荐方式)

### 1. 准备工作
1. 确保代码已推送到 GitHub/GitLab/Bitbucket 仓库
2. 注册 [Vercel 账户](https://vercel.com/)
3. 完成 Supabase 和 Stripe 的配置

### 2. 一键部署
点击 README 中的部署按钮：
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnextjs-subscription-payments&env=NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,STRIPE_SECRET_KEY&envDescription=Enter%20your%20Stripe%20API%20keys.&envLink=https%3A%2F%2Fdashboard.stripe.com%2Fapikeys&project-name=nextjs-subscription-payments&repository-name=nextjs-subscription-payments&integration-ids=oac_VqOgBHqhEoFTPzGkPd7L0iH6&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnextjs-subscription-payments%2Ftree%2Fmain)

### 3. 手动部署步骤
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择你的 Git 仓库
4. 配置项目设置：
   - Framework Preset: Next.js
   - Root Directory: / (根目录)
   - Build and Output Settings: 使用默认设置

### 4. 配置环境变量
在 Vercel 项目设置中配置以下环境变量：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的Supabase服务角色密钥

# Stripe 配置
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=你的Stripe发布密钥
STRIPE_SECRET_KEY=你的Stripe密钥
STRIPE_WEBHOOK_SECRET=你的Stripe webhook密钥

# 站点URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 使用 Netlify 部署

### 1. 准备工作
1. 注册 [Netlify 账户](https://netlify.com/)
2. 将代码推送到 Git 仓库

### 2. 部署步骤
1. 登录 Netlify 控制台
2. 点击 "New site from Git"
3. 选择你的 Git 仓库
4. 配置部署设置：
   - Build command: `next build`
   - Publish directory: `.next/server`
   - Environment variables: 添加所有必需的环境变量

### 3. 环境变量配置
在 Netlify 项目设置中配置环境变量，与 Vercel 相同。

## 自托管部署

### 1. 构建项目
```bash
# 安装依赖
pnpm install

# 构建生产版本
pnpm build
```

### 2. 运行生产服务器
```bash
# 启动生产服务器
pnpm start
```

### 3. 使用 PM2 管理进程 (可选)
```bash
# 安装 PM2
npm install -g pm2

# 使用 PM2 启动应用
pm2 start npm --name "nextjs-app" -- start
```

### 4. 配置反向代理 (Nginx 示例)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

```

## Supabase 配置

### 1. 数据库迁移
如果使用 Vercel 一键部署，Supabase 迁移会自动完成。否则需要手动执行：

```bash
# 连接到远程数据库
pnpm supabase:link

# 推送数据库模式
pnpm supabase:push
```

### 2. 数据库种子
```bash
# 生成种子文件
pnpm supabase:generate-seed

# 重置数据库
pnpm supabase:reset
```

## Stripe 配置

### 1. Webhook 设置
1. 在 Stripe Dashboard 的 Developers > Webhooks 中添加端点
2. URL: `https://your-domain.com/api/webhooks`
3. 事件: 选择所有事件
4. 获取签名密钥并设置环境变量

### 2. 产品和价格设置
1. 在 Stripe Dashboard 的 Products 中创建产品
2. 为每个产品设置价格
3. 或使用 fixtures 文件快速设置测试数据：
```bash
stripe fixtures fixtures/stripe-fixtures.json
```

## 域名配置

### 1. 自定义域名
在 Vercel/Netlify 中添加自定义域名：
1. 在 DNS 提供商处添加 CNAME 记录
2. 在部署平台中验证域名

### 2. SSL 证书
Vercel 和 Netlify 会自动为自定义域名提供 SSL 证书。

## 环境变量详解

### 必需的环境变量
```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=ey...

# Stripe 配置
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 站点配置
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 可选的环境变量
```bash
# GitHub OAuth (如果使用)
SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=...
SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=...
```

## 监控和日志

### 1. Vercel 日志
```bash
# 安装 Vercel CLI
npm install -g vercel

# 查看日志
vercel logs your-domain.com
```

### 2. 错误监控
建议集成错误监控服务：
- Sentry
- LogRocket
- Rollbar

## 性能优化

### 1. 图片优化
Next.js 内置图片优化功能，确保使用 `next/image` 组件。

### 2. 静态资源
将静态资源放在 [public](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/public) 目录中以获得最佳性能。

### 3. 缓存策略
配置适当的 HTTP 缓存头以提高性能。

## 安全考虑

### 1. 环境变量
- 永远不要在客户端暴露服务角色密钥
- 使用环境变量存储敏感信息

### 2. HTTPS
确保所有通信都通过 HTTPS 进行。

### 3. 内容安全策略
配置适当的内容安全策略头。

## 故障排除

### 1. 环境变量问题
- 检查所有必需的环境变量是否已正确设置
- 确保没有多余的空格或特殊字符

### 2. 数据库连接问题
- 验证 Supabase URL 和密钥是否正确
- 检查数据库是否已正确迁移

### 3. 支付问题
- 验证 Stripe 密钥是否正确
- 检查 webhook 是否正确配置

## 备份和恢复

### 1. 数据库备份
```bash
# 导出数据库
pnpm supabase db dump --file backup.sql
```

### 2. 代码备份
确保代码已推送到远程 Git 仓库。

## 更新和维护

### 1. 代码更新
1. 推送新代码到 Git 仓库
2. Vercel/Netlify 会自动触发新部署

### 2. 依赖更新
```bash
# 更新依赖
pnpm update

# 构建并测试
pnpm build
```

通过遵循这个部署指南，你应该能够成功将项目部署到生产环境。根据你的具体需求选择最适合的部署方式。

## 中国用户访问速度优化

如果项目部署在国外服务器但需要服务中国用户，建议参考 [CHINA_DEPLOYMENT_OPTIMIZATION.md](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/CHINA_DEPLOYMENT_OPTIMIZATION.md) 文件中的优化方案：

### 主要优化措施包括：

1. **CDN 加速**
   - 使用阿里云 CDN、腾讯云 CDN 等中国本土 CDN 服务
   - 配置全球 CDN 如 Cloudflare 作为补充

2. **静态资源优化**
   - 将静态资源部署到中国的对象存储服务（如阿里云 OSS、腾讯云 COS）
   - 启用资源压缩和缓存策略

3. **数据库和 API 优化**
   - 实施缓存策略减少数据库访问
   - 优化 API 响应时间和数据传输量

4. **中国本土化部署**
   - 考虑在国内云服务商（阿里云、腾讯云等）部署镜像站点
   - 使用智能 DNS 根据用户位置解析到最近的服务器

通过实施这些优化措施，可以显著提升中国用户访问国外部署网站的速度和体验。