# 如何获取 Supabase 服务角色密钥

为了完整配置你的 Supabase 项目，你需要获取服务角色密钥。以下是详细步骤：

## 1. 登录 Supabase 控制台

1. 访问 [Supabase 控制台](https://app.supabase.com/)
2. 使用你的账户登录

## 2. 选择你的项目

1. 在项目列表中找到你的项目（URL 为 `https://ygizoncqsezmyhamwgmy.supabase.co` 的项目）
2. 点击进入项目

## 3. 获取 API 设置

1. 在左侧导航栏中，点击 "Settings"（设置）
2. 在设置菜单中，点击 "API"
3. 在 "Project API keys" 部分，你会看到两个密钥：
   - **anon public**: 这是公开的匿名密钥，用于客户端访问
   - **service_role**: 这是服务角色密钥，拥有管理员权限，只能在服务端使用

## 4. 复制服务角色密钥

1. 点击 "service_role" 密钥旁边的复制按钮
2. 将密钥保存到安全的地方

## 5. 更新环境变量

将获取到的服务角色密钥添加到你的 [.env.local](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/.env.local) 文件中：

```bash
SUPABASE_SERVICE_ROLE_KEY=你复制的服务角色密钥
```

## 6. 安全注意事项

### 密钥保护
- **永远不要**在客户端代码中暴露服务角色密钥
- **永远不要**将服务角色密钥提交到 Git 仓库
- 只在服务端代码中使用服务角色密钥

### 环境变量安全
确保 [.env.local](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/.env.local) 文件已添加到 [.gitignore](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/.gitignore) 文件中，避免意外提交到代码仓库：

```gitignore
# Environment variables
.env*.local
```

## 7. 验证配置

更新环境变量后，可以通过以下方式验证配置是否正确：

1. 重启开发服务器：
```bash
pnpm dev
```

2. 检查控制台是否有 Supabase 连接错误
3. 尝试访问需要认证的页面，确保认证功能正常

## 8. 故障排除

### 常见问题
1. **连接失败**: 检查 URL 和密钥是否正确
2. **权限错误**: 确保使用正确的密钥（客户端用 anon key，服务端用 service role key）
3. **环境变量未加载**: 确保环境变量文件名正确且位于项目根目录

### 调试步骤
1. 检查环境变量是否正确加载：
```javascript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('Supabase Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY);
```

2. 检查网络连接是否正常
3. 确认 Supabase 项目是否正常运行

通过以上步骤，你应该能够成功获取并配置 Supabase 服务角色密钥，使项目能够正常连接到你的 Supabase 数据库。