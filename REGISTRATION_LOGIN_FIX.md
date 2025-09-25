# 注册后登录报错问题诊断与修复方案

根据对你的系统代码分析，我发现了可能导致注册后登录报错的问题和解决方案。

## 问题诊断

### 1. 注册流程分析
从代码中可以看出，注册使用的是 `supabase.auth.signUp()` 方法：

```typescript
const { error, data } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: callbackURL
  }
});
```

注册成功后，系统会返回以下几种情况：
1. `data.session` 存在：用户已登录
2. `data.user` 存在但未验证：需要邮箱验证
3. `error` 存在：注册失败

### 2. 登录流程分析
登录使用的是 `supabase.auth.signInWithPassword()` 方法：

```typescript
const { error, data } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

登录可能失败的原因：
1. 邮箱未验证
2. 密码错误
3. 用户不存在
4. Supabase 配置问题

## 常见问题和解决方案

### 问题1: 邮箱未验证导致登录失败
**现象**: 注册成功但登录时报错"Invalid login credentials"或类似错误

**原因**: Supabase 默认要求邮箱验证后才能登录

**解决方案**:

#### 方案A: 禁用邮箱验证（开发环境推荐）
1. 登录 Supabase 控制台
2. 进入你的项目
3. 导航到 Authentication → Settings
4. 找到 "Enable email confirmations" 选项并关闭它

#### 方案B: 完成邮箱验证
1. 检查注册邮箱是否收到验证邮件
2. 点击邮件中的验证链接
3. 验证成功后重新尝试登录

### 问题2: 注册和登录的 Supabase 配置不一致
**现象**: 注册成功但登录时报错

**解决方案**:
1. 确保 [.env.local](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/.env.local) 文件中的配置正确：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ygizoncqsezmyhamwgmy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnaXpvbmNxc2V6bXloYW13Z215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3ODM1NjIsImV4cCI6MjA3NDM1OTU2Mn0.zOenkar5JDsISvQFdkux9XgHDqiKXwjw9uck48nwOMA
```

### 问题3: 数据库触发器未正确创建
**现象**: 用户注册后，[users](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/utils/supabase/queries.ts#L35-L37) 表中没有对应的记录

**解决方案**:
1. 确保 [schema.sql](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/schema.sql) 中的触发器已正确执行：

```sql
/**
* This trigger automatically creates a user entry when a new user signs up via Supabase Auth.
*/ 
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

2. 在 Supabase SQL 编辑器中手动执行这段代码

### 问题4: 用户表行级安全策略问题
**现象**: 登录后无法获取用户信息

**解决方案**:
1. 检查 [users](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/utils/supabase/queries.ts#L35-L37) 表的行级安全策略：

```sql
alter table users enable row level security;
create policy "Can view own user data." on users for select using (auth.uid() = id);
create policy "Can update own user data." on users for update using (auth.uid() = id);
```

2. 在 Supabase SQL 编辑器中确认这些策略已正确应用

## 调试步骤

### 1. 检查注册响应数据
在 [signUp](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/utils/auth-helpers/server.ts#L203-L251) 函数中添加调试日志：

```typescript
export async function signUp(formData: FormData) {
  
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackURL
    }
  });
  
  // 添加调试日志
  console.log('注册响应:', { error, data });

}
```

### 2. 检查登录响应数据
在 [signInWithPassword](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/utils/auth-helpers/server.ts#L104-L139) 函数中添加调试日志：

```typescript
export async function signInWithPassword(formData: FormData) {
  
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  // 添加调试日志
  console.log('登录响应:', { error, data });

}
```

### 3. 检查数据库中的用户记录
在 Supabase SQL 编辑器中执行以下查询：

```sql
-- 检查 auth.users 表中的用户
SELECT * FROM auth.users WHERE email = 'your-email@example.com';

-- 检查 public.users 表中的用户
SELECT * FROM users WHERE id IN (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

## 修复步骤

### 步骤1: 检查并修复 Supabase 配置
1. 确认 [.env.local](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/.env.local) 文件配置正确
2. 重启开发服务器

### 步骤2: 检查并修复数据库结构
1. 登录 Supabase 控制台
2. 进入 SQL 编辑器
3. 执行以下查询检查表和触发器：

```sql
-- 检查 users 表是否存在
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
);

-- 检查触发器函数是否存在
SELECT EXISTS (
  SELECT FROM pg_proc 
  WHERE proname = 'handle_new_user'
);

-- 检查触发器是否存在
SELECT EXISTS (
  SELECT FROM pg_trigger 
  WHERE tgname = 'on_auth_user_created'
);
```

4. 如果不存在，执行 [schema.sql](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/schema.sql) 中的相关部分

### 步骤3: 检查认证设置
1. 登录 Supabase 控制台
2. 进入 Authentication → Settings
3. 确认以下设置：
   - Site URL 设置正确
   - Redirect URLs 包含你的域名
   - 根据需要启用或禁用邮箱验证

### 步骤4: 测试修复
1. 清除浏览器缓存和 cookies
2. 重新注册新用户
3. 根据设置完成邮箱验证（如果启用）
4. 尝试登录

通过以上步骤，你应该能够诊断并修复注册后登录报错的问题。