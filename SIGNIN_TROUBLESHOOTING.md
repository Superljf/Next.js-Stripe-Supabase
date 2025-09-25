# 注册后无法登录故障排除指南

如果你在注册后无法登录，可以按照以下步骤进行排查和解决。

## 1. 常见问题和解决方案

### 1.1 邮箱未验证
**问题**: 注册后需要验证邮箱才能登录
**解决方案**: 
1. 检查邮箱收件箱（包括垃圾邮件文件夹）是否有验证邮件
2. 点击验证邮件中的链接完成验证
3. 重新尝试登录

### 1.2 密码错误
**问题**: 输入的密码与注册时设置的密码不匹配
**解决方案**:
1. 确认密码输入正确（注意大小写）
2. 使用"忘记密码"功能重置密码
3. 重新设置新密码

### 1.3 用户不存在
**问题**: 注册未成功完成或用户被删除
**解决方案**:
1. 重新注册账户
2. 确认注册过程中没有错误提示
3. 检查邮箱是否已验证

## 2. 技术排查步骤

### 2.1 检查环境变量配置
确保 [.env.local](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/.env.local) 文件中的 Supabase 配置正确：
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ygizoncqsezmyhamwgmy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnaXpvbmNxc2V6bXloYW13Z215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3ODM1NjIsImV4cCI6MjA3NDM1OTU2Mn0.zOenkar5JDsISvQFdkux9XgHDqiKXwjw9uck48nwOMA
```

### 2.2 检查 Supabase 项目配置
1. 登录 [Supabase 控制台](https://app.supabase.com/)
2. 进入你的项目
3. 检查 "Authentication" → "Providers" 设置：
   - 确保 "Email" 提供商已启用
   - 确认 "Confirm email" 设置符合你的需求

### 2.3 检查数据库表
确保必要的数据库表已创建：
1. 在 Supabase SQL 编辑器中检查是否存在以下表：
   - `users`
   - `customers`
2. 检查 `auth.users` 表中是否存在你的用户记录

### 2.4 检查认证设置
在 Supabase 控制台中检查：
1. "Authentication" → "Settings" → "Site URL" 是否正确设置
2. "Authentication" → "Settings" → "Redirect URLs" 是否包含你的域名

## 3. 调试方法

### 3.1 浏览器控制台检查
1. 打开浏览器开发者工具 (F12)
2. 切换到 Console 标签
3. 尝试登录并查看是否有错误信息

### 3.2 网络请求检查
1. 打开浏览器开发者工具
2. 切换到 Network 标签
3. 尝试登录并查看请求和响应
4. 检查是否有 400、401、403 等错误状态码

### 3.3 服务端日志检查
如果项目已部署，检查部署平台的日志：
```bash
# 如果使用 Vercel
vercel logs your-domain.com

# 如果本地运行
# 查看终端中的错误信息
```

## 4. 代码层面排查

### 4.1 检查认证函数
查看 [utils/auth-helpers/server.ts](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/utils/auth-helpers/server.ts) 中的 [signInWithPassword](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/utils/auth-helpers/server.ts#L104-L139) 函数：

```typescript
export async function signInWithPassword(formData: FormData) {
  const cookieStore = cookies();
  const email = String(formData.get('email')).trim();
  const password = String(formData.get('password')).trim();
  let redirectPath: string;

  const supabase = createClient();
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    // 错误处理
    redirectPath = getErrorRedirect(
      '/signin/password_signin',
      'Sign in failed.',
      error.message
    );
  } else if (data.user) {
    // 成功处理
    cookieStore.set('preferredSignInView', 'password_signin', { path: '/' });
    redirectPath = getStatusRedirect('/', 'Success!', 'You are now signed in.');
  } else {
    // 其他情况
    redirectPath = getErrorRedirect(
      '/signin/password_signin',
      'Hmm... Something went wrong.',
      'You could not be signed in.'
    );
  }

  return redirectPath;
}
```

### 4.2 检查客户端处理
查看 [utils/auth-helpers/client.ts](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/utils/auth-helpers/client.ts) 中的 [handleRequest](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/utils/auth-helpers/client.ts#L12-L27) 函数：

```typescript
export async function handleRequest(
  e: React.FormEvent<HTMLFormElement>,
  requestFunc: (formData: FormData) => Promise<string>,
  router: AppRouterInstance | null = null
): Promise<boolean | void> {
  // Prevent default form submission refresh
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const redirectUrl: string = await requestFunc(formData);

  if (router) {
    // If client-side router is provided, use it to redirect
    return router.push(redirectUrl);
  } else {
    // Otherwise, redirect server-side
    return await redirectToPath(redirectUrl);
  }
}
```

## 5. Supabase 特定问题

### 5.1 检查用户状态
在 Supabase SQL 编辑器中运行以下查询：
```sql
SELECT * FROM auth.users WHERE email = 'your-email@example.com';
```

检查字段：
- `email_confirmed_at`: 邮箱是否已确认
- `banned_until`: 账户是否被禁用
- `deleted_at`: 账户是否被删除

### 5.2 检查行级安全策略
确保 `users` 表的行级安全策略正确：
```sql
-- 检查 users 表的策略
SELECT * FROM pg_policy WHERE polrelid = 'users'::regclass;
```

## 6. 常见错误信息和解决方案

### 6.1 "Invalid login credentials"
**可能原因**: 
- 密码错误
- 用户不存在
- 用户未验证邮箱

**解决方案**:
- 确认密码正确
- 检查邮箱是否已验证
- 使用"忘记密码"功能重置密码

### 6.2 "Email not confirmed"
**可能原因**: 用户未点击验证邮件中的链接

**解决方案**:
- 重新发送验证邮件
- 检查垃圾邮件文件夹
- 点击验证链接

### 6.3 "User already registered"
**可能原因**: 使用已注册的邮箱尝试注册

**解决方案**:
- 使用"忘记密码"功能重置密码
- 使用已有的账户登录

## 7. 联系支持

如果以上方法都无法解决问题：
1. 在 Supabase Discord 社区寻求帮助
2. 在 GitHub 项目中提交 issue
3. 联系 Supabase 官方支持

通过以上步骤，你应该能够诊断并解决注册后无法登录的问题。