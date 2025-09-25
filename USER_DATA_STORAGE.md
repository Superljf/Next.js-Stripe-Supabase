# 用户信息存储说明

在本项目中，用户注册成功后，用户信息会存储在两个不同的表中。

## 1. auth.users 表（Supabase 内置认证表）

这是 Supabase 提供的内置认证表，用于存储用户的核心认证信息。

### 存储内容：
- `id`: 用户唯一标识符 (UUID)
- `email`: 用户邮箱地址
- `encrypted_password`: 加密后的密码
- `email_confirmed_at`: 邮箱确认时间
- `invited_at`: 邀请时间（如果适用）
- `confirmation_token`: 确认令牌
- `recovery_token`: 恢复令牌
- `email_change_token_new`: 邮箱变更令牌
- `created_at`: 账户创建时间
- `updated_at`: 账户更新时间

### 特点：
- 由 Supabase 自动管理
- 不能直接修改（需要使用 Supabase Auth API）
- 存储敏感的认证信息

## 2. public.users 表（项目自定义用户表）

这是项目中自定义的用户表，用于存储用户的额外信息。

### 存储内容：
- `id`: 用户唯一标识符 (UUID)，与 auth.users.id 关联
- `full_name`: 用户全名
- `avatar_url`: 用户头像 URL
- `billing_address`: 账单地址（JSONB 格式）
- `payment_method`: 支付方式信息（JSONB 格式）

### 特点：
- 由项目自定义创建
- 可以直接查询和修改
- 存储非敏感的用户信息
- 通过外键与 auth.users 表关联

## 3. 数据同步机制

### 触发器函数
当用户在 `auth.users` 表中注册时，会自动触发一个函数来在 `public.users` 表中创建对应的记录：

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

### 同步过程：
1. 用户调用 `supabase.auth.signUp()` 注册
2. Supabase 在 `auth.users` 表中创建用户记录
3. 触发器自动在 `public.users` 表中创建对应的用户记录
4. 用户信息在两个表中保持同步

## 4. 数据查询方式

### 获取认证用户信息
```typescript
// 从 auth.users 表获取
const { data: { user } } = await supabase.auth.getUser();
```

### 获取用户详细信息
```typescript
// 从 public.users 表获取
const { data: userDetails } = await supabase
  .from('users')
  .select('*')
  .single();
```

## 5. 数据访问权限

### auth.users 表
- 只能通过 Supabase Auth API 访问
- 用户只能访问自己的认证信息

### public.users 表
- 通过行级安全策略(RLS)控制访问
- 用户只能查看和更新自己的信息

```sql
alter table users enable row level security;
create policy "Can view own user data." on users for select using (auth.uid() = id);
create policy "Can update own user data." on users for update using (auth.uid() = id);
```

## 6. 验证数据存储

可以通过以下 SQL 查询验证用户信息是否正确存储：

```sql
-- 查询 auth.users 表中的用户
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'user@example.com';

-- 查询 public.users 表中的用户
SELECT id, full_name, avatar_url 
FROM users 
WHERE id = 'user-uuid';
```

通过这种双表存储机制，项目既利用了 Supabase 强大的认证功能，又能够灵活地存储和管理用户的额外信息。