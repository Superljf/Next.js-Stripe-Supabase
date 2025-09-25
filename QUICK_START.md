# 快速启动指南（跳过 Supabase 和 Stripe 配置）

本指南将帮助你快速启动前端部分，无需配置 Supabase 和 Stripe。

## 前置要求

1. 确保已安装 [Node.js](https://nodejs.org/) (推荐 LTS 版本)
2. 确保已安装 [pnpm](https://pnpm.io/installation)

## 启动步骤

### 1. 安装依赖

在项目根目录运行：

```bash
pnpm install
```

### 2. 创建基础环境变量文件

创建一个简单的 [.env.local](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/.env.local) 文件，只包含基本配置：

```bash
echo "NEXT_PUBLIC_SITE_URL=http://localhost:3000" > .env.local
```

### 3. 启动开发服务器

运行以下命令启动开发服务器：

```bash
pnpm dev
```

### 4. 访问应用

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 注意事项

- 由于跳过了 Supabase 配置，用户认证功能将不可用
- 由于跳过了 Stripe 配置，支付功能将不可用
- 你仍然可以查看大部分 UI 界面和静态内容
- 如需完整功能，请参考完整的设置指南

## 可能遇到的问题

1. **页面显示错误或空白**：这是正常的，因为缺少后端服务支持
2. **认证相关页面无法使用**：登录/注册功能需要 Supabase 配置
3. **支付相关功能不可用**：需要 Stripe 配置才能处理支付

## 下一步

如果你需要完整的功能，建议：
1. 配置 Supabase 服务以启用用户认证
2. 配置 Stripe 服务以启用支付功能
3. 参考 [README.md](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/README.md) 文件获取完整的设置指南