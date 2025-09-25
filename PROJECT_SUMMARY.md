# Next.js-Stripe-Supabase 项目概述

这是一个基于 Next.js 的订阅支付系统模板，集成了 Stripe 支付服务和 Supabase 作为后端服务。它提供了一个完整的 SaaS 订阅支付解决方案，允许用户注册、登录、选择订阅计划并进行支付。

## 核心功能

### 1. 用户认证系统
- 使用 Supabase Auth 进行用户管理
- 支持邮箱/密码注册登录
- 支持 GitHub OAuth 登录
- 自动创建用户记录的触发器

### 2. 订阅支付功能
- 集成 Stripe Checkout 和客户门户
- 支持月付和年付订阅计划
- 自动同步定价计划和订阅状态
- 通过 Stripe Webhooks 处理支付事件

### 3. 数据管理
- 使用 Supabase PostgreSQL 数据库
- 自动同步 Stripe 产品和价格信息到本地数据库
- 实时订阅状态管理

## 技术架构

### 前端技术栈
- **Next.js 14**: React 框架，支持服务端渲染
- **TypeScript**: 静态类型检查
- **Tailwind CSS**: UI 样式框架
- **Stripe.js**: Stripe 客户端集成

### 后端技术栈
- **Supabase**:
  - 数据库 (PostgreSQL)
  - 认证服务
  - 实时功能
- **Stripe**: 支付处理
- **Vercel**: 部署平台

## 数据库结构

项目包含以下主要数据表：
- `users`: 存储用户基本信息
- `customers`: 用户与 Stripe 客户的映射关系
- `products`: 产品信息（来自 Stripe）
- `prices`: 价格信息（来自 Stripe）
- `subscriptions`: 订阅信息（来自 Stripe）

## 核心流程

### 1. 用户注册/登录
1. 用户通过 Supabase Auth 注册或登录
2. 触发器自动在 users 表中创建用户记录

### 2. 订阅流程
1. 用户在定价页面选择订阅计划
2. 点击订阅按钮跳转到 Stripe Checkout
3. 完成支付后通过 webhook 同步订阅状态

### 3. 支付处理
1. Stripe Webhooks 接收支付事件
2. 自动更新本地数据库中的订阅状态

## 项目优势

- **完整的订阅支付解决方案**: 从用户认证到支付处理的一站式解决方案
- **自动同步**: Stripe 与本地数据库的自动同步机制
- **安全性**: 使用 Supabase 的行级安全策略保护数据
- **可扩展性**: 模块化设计，易于扩展新功能
- **现代化技术栈**: 使用最新的 Next.js、TypeScript 和 Tailwind CSS

## 部署方式

项目支持通过 Vercel 一键部署，集成 Supabase Vercel 部署工具，可以自动设置环境变量和数据库迁移。这个项目非常适合需要快速搭建订阅支付系统的开发者，提供了完整的基础设施和最佳实践。

## 快速启动（跳过配置）

如果你只想快速查看前端界面，而不想配置 Supabase 和 Stripe：

1. 安装依赖：
   ```bash
   pnpm install
   ```

2. 创建基础环境变量文件：
   ```bash
   echo "NEXT_PUBLIC_SITE_URL=http://localhost:3000" > .env.local
   ```

3. 启动开发服务器：
   ```bash
   pnpm dev
   ```

4. 在浏览器中访问 http://localhost:3000

注意：此方式下用户认证和支付功能将不可用，但你可以查看大部分 UI 界面。

## 启动项目步骤

### 1. 安装依赖
首先，确保你已经安装了 [pnpm](https://pnpm.io/installation)。然后在项目根目录运行：

```bash
pnpm install
```

### 2. 配置环境变量
将 [.env.local.example](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/.env.local.example) 文件复制为 [.env.local](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/.env.local)：
```bash
cp .env.local.example .env.local
```

然后根据你的配置填写以下环境变量：
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase 服务角色密钥
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe 公钥
- `STRIPE_SECRET_KEY` - Stripe 私钥
- `STRIPE_WEBHOOK_SECRET` - Stripe Webhook 密钥

### 3. 启动本地 Supabase 实例（推荐）
如果你需要本地开发环境，需要安装 [Docker](https://www.docker.com/get-started/)，然后运行：
```bash
pnpm supabase:start
```

### 4. 启动 Stripe webhook 监听器（用于处理支付回调）
如果你需要处理 Stripe 支付回调，需要安装 [Stripe CLI](https://stripe.com/docs/stripe-cli) 并运行：
```bash
pnpm stripe:login
pnpm stripe:listen
```

### 5. 启动开发服务器
在单独的终端中运行：
```bash
pnpm dev
```

然后在浏览器中访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 注意事项

1. 你需要配置 Supabase 和 Stripe 账户才能完整运行此项目
2. 如果你只是想查看前端界面，可以跳过 Supabase 和 Stripe 配置，但部分功能将不可用
3. webhook 监听器和开发服务器需要同时运行才能正确处理支付回调
