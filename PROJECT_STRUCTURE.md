# 项目结构说明

## 概述

这是一个基于 Next.js 14 (App Router)、Supabase 和 Stripe 的订阅支付系统模板。项目支持国际用户的 Stripe 支付和中国用户的微信支付。

## 目录结构

```
Next.js-Stripe-Supabase/
├── app/                    # Next.js App Router 目录
│   ├── account/           # 账户页面
│   ├── api/               # API 路由
│   │   └── webhooks/      # Webhook 处理
│   ├── auth/              # 认证相关页面
│   ├── signin/            # 登录/注册页面
│   └── ...                # 其他页面和布局文件
├── components/            # React 组件
│   ├── icons/             # 图标组件
│   └── ui/                # UI 组件
├── fixtures/              # Stripe 测试数据
├── public/                # 静态资源
├── styles/                # 样式文件
├── supabase/              # Supabase 配置和迁移文件
├── utils/                 # 工具函数
│   ├── auth-helpers/      # 认证辅助函数
│   ├── stripe/            # Stripe 集成
│   ├── supabase/          # Supabase 集成
│   └── wechatpay/         # 微信支付集成
└── ...                    # 配置文件、文档等
```

## 核心目录详解

### 1. `app/` 目录 (Next.js App Router)

这是 Next.js 14 的 App Router 目录，包含应用的所有页面和路由。

- `account/` - 用户账户管理页面
- `api/` - API 路由处理器
  - `webhooks/` - 支付平台 Webhook 处理
    - `route.ts` - Stripe webhook 处理器
    - `wechat/` - 微信支付 webhook 处理器
- `auth/` - 认证相关页面 (回调、确认等)
- `signin/` - 登录和注册页面
- `layout.tsx` - 应用根布局
- `page.tsx` - 首页 (定价页面)

### 2. `components/` 目录

包含所有 React UI 组件，按功能分类：

- `ui/` - 通用 UI 组件
  - `AccountForms/` - 账户表单组件
  - `AuthForms/` - 认证表单组件
  - `Button/` - 按钮组件
  - `Pricing/` - 定价页面组件
  - `Navbar/` - 导航栏组件
  - `Footer/` - 页脚组件
  - 等等...

### 3. `utils/` 目录

包含各种工具函数和集成代码：

#### `utils/auth-helpers/`
- 认证相关的辅助函数
- 服务端和客户端的认证逻辑

#### `utils/stripe/`
- `client.ts` - Stripe 客户端初始化
- `config.ts` - Stripe 配置
- `server.ts` - Stripe 服务端操作 (结账、门户等)

#### `utils/supabase/`
- `admin.ts` - Supabase 管理员操作
- `client.ts` - Supabase 客户端初始化
- `middleware.ts` - Supabase 中间件
- `queries.ts` - 数据库查询函数
- `server.ts` - Supabase 服务端客户端

#### `utils/wechatpay/`
- `client.ts` - 微信支付客户端函数
- `config.ts` - 微信支付配置
- `server.ts` - 微信支付服务端操作

### 4. `supabase/` 目录

包含 Supabase 相关的配置和迁移文件：

- `migrations/` - 数据库迁移文件
- `seed.sql` - 数据库种子数据
- `config.toml` - Supabase CLI 配置

## 核心功能模块

### 1. 用户认证系统

基于 Supabase Auth 实现：
- 用户注册/登录
- OAuth 集成 (GitHub等)
- 会话管理
- 用户资料管理

### 2. 支付系统

#### Stripe 集成
- 产品和价格同步
- 订阅管理
- 支付结账流程
- 客户门户
- Webhook 处理

#### 微信支付集成
- Native 支付 (二维码)
- 支付状态同步
- Webhook 处理

### 3. 数据库设计

使用 Supabase (PostgreSQL) 存储：

#### 核心表结构
- `users` - 用户信息表
- `customers` - 客户映射表 (用户ID ↔ Stripe客户ID)
- `products` - 产品信息 (来自 Stripe)
- `prices` - 价格信息 (来自 Stripe)
- `subscriptions` - 订阅信息 (来自 Stripe)

#### 安全策略
- 行级安全 (RLS) 策略
- 用户只能访问自己的数据
- 产品和价格信息公开可读

## 环境变量配置

项目使用以下环境变量：

### 必需变量
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase 服务角色密钥
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe 公钥
- `STRIPE_SECRET_KEY` - Stripe 私钥
- `STRIPE_WEBHOOK_SECRET` - Stripe Webhook 密钥

### 微信支付变量 (可选)
- `WECHAT_PAY_APP_ID` - 微信支付应用ID
- `WECHAT_PAY_MCH_ID` - 微信支付商户ID
- `WECHAT_PAY_PRIVATE_KEY` - 微信支付私钥
- `WECHAT_PAY_SERIAL_NO` - 证书序列号
- `WECHAT_PAY_APIV3_KEY` - APIv3密钥

## 开发和部署

### 本地开发
1. 安装依赖: `pnpm install`
2. 启动本地 Supabase: `pnpm supabase:start`
3. 启动 Stripe webhook 转发: `pnpm stripe:listen`
4. 启动开发服务器: `pnpm dev`

### 部署
- 推荐使用 Vercel 部署
- 需要配置相应的环境变量
- 需要设置 Webhook 回调地址

## 扩展性考虑

### 添加新的支付方式
1. 在 `utils/` 目录下创建新的支付提供商目录
2. 实现相应的客户端和服务端函数
3. 在定价组件中添加新的支付选项
4. 创建相应的 webhook 处理器

### 添加新的认证提供商
1. 在 Supabase 仪表板中配置新的 OAuth 提供商
2. 更新认证相关的 UI 组件
3. 调整相应的认证辅助函数

这个项目结构清晰地分离了关注点，使得添加新功能或修改现有功能变得更加容易。