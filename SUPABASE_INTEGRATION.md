# Supabase 对接指南

本指南将详细介绍如何在 Next.js 项目中对接和使用 Supabase。

## 1. 创建 Supabase 项目

### 1.1 注册 Supabase 账户
1. 访问 [Supabase 官网](https://supabase.com/)
2. 点击 "Start your project" 并注册账户
3. 创建新项目

### 1.2 获取项目凭证
在 Supabase 项目仪表板中，找到以下信息：
- Project URL: 项目 URL
- Project API keys: 匿名密钥 (anon key) 和服务角色密钥 (service role key)

## 2. 配置环境变量

将凭证添加到 [.env.local](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/.env.local) 文件中：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的服务角色密钥
```

## 3. 数据库设置

### 3.1 创建数据库表
项目已经包含了数据库结构定义文件 [schema.sql](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/schema.sql)。在 Supabase SQL 编辑器中执行此文件来创建表：

1. 在 Supabase 仪表板中导航到 SQL 编辑器
2. 复制 [schema.sql](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/schema.sql) 的内容
3. 粘贴到编辑器中并执行

### 3.2 数据库表结构
项目包含以下主要表：
- `users`: 用户信息表
- `customers`: 用户与 Stripe 客户的映射
- `products`: 产品信息（来自 Stripe）
- `prices`: 价格信息（来自 Stripe）
- `subscriptions`: 订阅信息（来自 Stripe）

## 4. 客户端集成

### 4.1 创建客户端实例
在 [utils/supabase/client.ts](file:///d:/2025%E4%B8%8B%E5%8D%E5%B9%B4Code/Next.js-Stripe-Supabase/utils/supabase/client.ts) 中：

```typescript
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types_db';

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

### 4.2 在组件中使用
```typescript
'use client';

import { createClient } from '@/utils/supabase/client';

export default function MyComponent() {
  const supabase = createClient();
  
  // 执行数据库操作
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Data:', data);
    }
  };
  
  return (
    <div>
      {/* 组件内容 */}
    </div>
  );
}
```

## 5. 服务端集成

### 5.1 创建服务端实例
在 [utils/supabase/server.ts](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/utils/supabase/server.ts) 中：

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // 处理错误
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // 处理错误
          }
        }
      }
    }
  );
};
```

### 5.2 在服务端组件中使用
```typescript
import { createClient } from '@/utils/supabase/server';

export default async function ServerComponent() {
  const supabase = createClient();
  
  // 获取用户信息
  const { data: { user } } = await supabase.auth.getUser();
  
  // 查询数据
  const { data: products } = await supabase
    .from('products')
    .select('*');
  
  return (
    <div>
      {/* 渲染内容 */}
    </div>
  );
}
```

## 6. 管理员操作

对于需要管理员权限的操作，使用 [utils/supabase/admin.ts](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/utils/supabase/admin.ts) 中的服务：

```typescript
import { createClient } from '@supabase/supabase-js';

// 使用服务角色密钥创建管理员客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);
```

## 7. 认证功能

### 7.1 用户注册
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});
```

### 7.2 用户登录
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

### 7.3 OAuth 登录
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: 'http://localhost:3000/auth/callback'
  }
});
```

## 8. 数据操作

### 8.1 查询数据
```typescript
// 查询所有产品
const { data: products, error } = await supabase
  .from('products')
  .select('*');

// 条件查询
const { data: activeProducts, error } = await supabase
  .from('products')
  .select('*')
  .eq('active', true);
```

### 8.2 插入数据
```typescript
const { data, error } = await supabase
  .from('users')
  .insert([
    { id: 'user-id', full_name: 'John Doe' }
  ]);
```

### 8.3 更新数据
```typescript
const { data, error } = await supabase
  .from('users')
  .update({ full_name: 'Jane Doe' })
  .eq('id', 'user-id');
```

### 8.4 删除数据
```typescript
const { data, error } = await supabase
  .from('users')
  .delete()
  .eq('id', 'user-id');
```

## 9. 实时功能

启用实时订阅：

```typescript
// 订阅产品表的变化
const channel = supabase
  .channel('products-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'products'
    },
    (payload) => {
      console.log('New product:', payload.new);
    }
  )
  .subscribe();
```

## 10. 常见问题

### 10.1 环境变量未正确加载
确保 [.env.local](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/.env.local) 文件位于项目根目录，并且变量名正确。

### 10.2 权限错误
检查 Supabase 表的行级安全策略(RLS)设置。

### 10.3 认证状态问题
确保正确处理 cookies，在服务端和客户端之间同步认证状态。

## 11. 最佳实践

1. **安全**: 永远不要在客户端暴露服务角色密钥
2. **性能**: 使用缓存和分页处理大量数据
3. **错误处理**: 始终检查和处理 Supabase 操作的错误
4. **类型安全**: 使用生成的 TypeScript 类型
5. **环境分离**: 为开发、测试和生产环境使用不同的 Supabase 项目