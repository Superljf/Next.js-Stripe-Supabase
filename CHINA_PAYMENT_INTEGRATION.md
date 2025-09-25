# 中国支付方式对接指南

由于 Stripe 在中国的使用限制，你可能需要将项目中的支付方式替换为中国的支付解决方案，如支付宝、微信支付等。本指南将详细介绍如何修改现有项目以支持中国支付方式。

## 支持的中国支付方式

### 1. 支付宝 (Alipay)
- 支付宝开放平台：https://open.alipay.com/
- 支持 PC 网站支付、手机网站支付、当面付等

### 2. 微信支付 (WeChat Pay)
- 微信支付商户平台：https://pay.weixin.qq.com/
- 支持 JSAPI 支付、Native 支付、APP 支付等

### 3. 银联支付 (UnionPay)
- 云闪付：https://open.unionpay.com/

## 修改方案概述

要将项目从 Stripe 迁移至中国支付方式，需要进行以下修改：

### 1. 移除 Stripe 依赖
```bash
# 从 package.json 中移除 Stripe 相关依赖
npm uninstall @stripe/stripe-js stripe
```

### 2. 安装中国支付 SDK
根据选择的支付方式安装相应的 SDK：

#### 支付宝
```bash
npm install alipay-sdk
```

#### 微信支付
```bash
npm install wechatpay-node-v3
```

## 详细修改步骤

### 1. 修改环境变量
在 [.env.local](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/.env.local) 文件中移除 Stripe 相关变量，添加新的支付方式配置：

```bash
# 支付宝配置示例
ALIPAY_APP_ID=your_alipay_app_id
ALIPAY_PRIVATE_KEY=your_alipay_private_key
ALIPAY_PUBLIC_KEY=your_alipay_public_key
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do

# 或微信支付配置示例
WECHAT_PAY_APP_ID=your_wechat_app_id
WECHAT_PAY_MCH_ID=your_mch_id
WECHAT_PAY_PRIVATE_KEY=your_private_key
WECHAT_PAY_SERIAL_NO=your_serial_no
```

### 2. 创建支付服务

#### 支付宝支付服务 (utils/alipay/server.ts)
```typescript
'use server';

import AlipaySdk from 'alipay-sdk';
import { createClient } from '@/utils/supabase/server';
import { createOrRetrieveCustomer } from '@/utils/supabase/admin';
import { getURL } from '@/utils/helpers';

const alipay = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID!,
  privateKey: process.env.ALIPAY_PRIVATE_KEY!,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY!,
  gateway: process.env.ALIPAY_GATEWAY!
});

export async function checkoutWithAlipay(
  price: any,
  redirectPath: string = '/account'
) {
  try {
    // 获取用户信息
    const supabase = createClient();
    const {
      error,
      data: { user }
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error('Could not get user session.');
    }

    // 创建或获取客户信息
    let customer: string;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user?.id || '',
        email: user?.email || ''
      });
    } catch (err) {
      throw new Error('Unable to access customer record.');
    }

    // 构造支付参数
    const params = {
      bizContent: {
        outTradeNo: `order_${Date.now()}`, // 订单号
        productCode: 'FAST_INSTANT_TRADE_PAY', // 销售产品码
        totalAmount: (price.unit_amount / 100).toString(), // 订单总金额
        subject: price.products?.name || 'Subscription', // 订单标题
        body: price.products?.description || 'Subscription payment' // 订单描述
      },
      returnUrl: getURL(redirectPath), // 同步回调地址
      notifyUrl: getURL('/api/webhooks/alipay') // 异步回调地址
    };

    // 调用支付宝接口创建支付表单
    const formData = alipay.pageExec('alipay.trade.page.pay', params);
    
    return { formData };
  } catch (error) {
    if (error instanceof Error) {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          error.message,
          'Please try again later or contact a system administrator.'
        )
      };
    } else {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      };
    }
  }
}
```

#### 微信支付服务 (utils/wechatpay/server.ts)
```typescript
'use server';

import WeChatPay from 'wechatpay-node-v3';
import { createClient } from '@/utils/supabase/server';
import { createOrRetrieveCustomer } from '@/utils/supabase/admin';
import { getURL } from '@/utils/helpers';

const wechatPay = new WeChatPay({
  appid: process.env.WECHAT_PAY_APP_ID!,
  mchid: process.env.WECHAT_PAY_MCH_ID!,
  privateKey: process.env.WECHAT_PAY_PRIVATE_KEY!,
  serial_no: process.env.WECHAT_PAY_SERIAL_NO!,
  apiv3_private_key: process.env.WECHAT_PAY_APIV3_PRIVATE_KEY!,
  notify_url: getURL('/api/webhooks/wechat')
});

export async function checkoutWithWeChatPay(
  price: any,
  redirectPath: string = '/account'
) {
  try {
    // 获取用户信息
    const supabase = createClient();
    const {
      error,
      data: { user }
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error('Could not get user session.');
    }

    // 创建或获取客户信息
    let customer: string;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user?.id || '',
        email: user?.email || ''
      });
    } catch (err) {
      throw new Error('Unable to access customer record.');
    }

    // 构造支付参数
    const params = {
      description: price.products?.name || 'Subscription',
      out_trade_no: `order_${Date.now()}`, // 商户订单号
      amount: {
        total: price.unit_amount, // 金额(分)
        currency: 'CNY'
      },
      notify_url: getURL('/api/webhooks/wechat')
    };

    // 调用微信支付统一下单接口
    const result = await wechatPay.transactions_native(params);
    
    return { codeUrl: result.code_url }; // 二维码链接
  } catch (error) {
    if (error instanceof Error) {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          error.message,
          'Please try again later or contact a system administrator.'
        )
      };
    } else {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      };
    }
  }
}
```

### 3. 修改前端组件

#### 更新定价页面 (components/ui/Pricing/Pricing.tsx)
```typescript
'use client';

import Button from '@/components/ui/Button';
import LogoCloud from '@/components/ui/LogoCloud';
import type { Tables } from '@/types_db';
import { checkoutWithAlipay } from '@/utils/alipay/server'; // 或引入微信支付
import { getErrorRedirect } from '@/utils/helpers';
import { User } from '@supabase/supabase-js';
import cn from 'classnames';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

// ... 其他导入和类型定义保持不变

export default function Pricing({ user, products, subscription }: Props) {
  // ... 其他代码保持不变

  // 修改处理支付的函数
  const handlePaymentCheckout = async (price: any) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push('/signin/signup');
    }

    // 根据选择的支付方式调用不同的函数
    const { errorRedirect, formData } = await checkoutWithAlipay(
      price,
      currentPath
    );

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    // 处理支付表单提交
    if (formData) {
      // 创建一个隐藏的表单并提交到支付宝
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = process.env.ALIPAY_GATEWAY!;
      form.innerHTML = formData;
      document.body.appendChild(form);
      form.submit();
    }

    setPriceIdLoading(undefined);
  };

  // ... 其余代码保持不变
}
```

### 4. 创建支付回调接口

#### 支付宝回调接口 (app/api/webhooks/alipay/route.ts)
```typescript
import { NextResponse } from 'next/server';
import { verifyAlipaySignature } from '@/utils/alipay/utils';
import { manageSubscriptionStatusChange } from '@/utils/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const paramsObj: any = {};
    
    for (const [key, value] of params.entries()) {
      paramsObj[key] = value;
    }

    // 验证签名
    const isValid = verifyAlipaySignature(paramsObj);
    if (!isValid) {
      return new NextResponse('Invalid signature', { status: 400 });
    }

    // 处理支付结果
    if (paramsObj.trade_status === 'TRADE_SUCCESS') {
      // 支付成功，更新订阅状态
      await manageSubscriptionStatusChange(
        paramsObj.out_trade_no,
        paramsObj.buyer_id,
        true
      );
    }

    return new NextResponse('success');
  } catch (error) {
    console.error('Alipay webhook error:', error);
    return new NextResponse('Webhook Error', { status: 400 });
  }
}
```

#### 微信支付回调接口 (app/api/webhooks/wechat/route.ts)
```typescript
import { NextResponse } from 'next/server';
import WeChatPay from 'wechatpay-node-v3';
import { manageSubscriptionStatusChange } from '@/utils/supabase/admin';

const wechatPay = new WeChatPay({
  appid: process.env.WECHAT_PAY_APP_ID!,
  mchid: process.env.WECHAT_PAY_MCH_ID!,
  privateKey: process.env.WECHAT_PAY_PRIVATE_KEY!,
  serial_no: process.env.WECHAT_PAY_SERIAL_NO!,
  apiv3_private_key: process.env.WECHAT_PAY_APIV3_PRIVATE_KEY!
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 验证签名
    const isValid = wechatPay.verifySignature(req.headers, body);
    if (!isValid) {
      return new NextResponse('Invalid signature', { status: 400 });
    }

    // 处理支付结果
    if (body.event_type === 'TRANSACTION.SUCCESS') {
      const decryptedData = wechatPay.decipher_gcm(
        body.resource.ciphertext,
        body.resource.associated_data,
        body.resource.nonce
      );
      
      if (decryptedData.trade_state === 'SUCCESS') {
        // 支付成功，更新订阅状态
        await manageSubscriptionStatusChange(
          decryptedData.out_trade_no,
          decryptedData.payer?.openid,
          true
        );
      }
    }

    return new NextResponse(JSON.stringify({ code: 'SUCCESS', message: '成功' }));
  } catch (error) {
    console.error('WeChat Pay webhook error:', error);
    return new NextResponse('Webhook Error', { status: 400 });
  }
}
```

### 5. 更新数据库操作

需要修改 [utils/supabase/admin.ts](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/utils/supabase/admin.ts) 中与支付相关的函数，使其适应新的支付方式：

```typescript
// 修改 manageSubscriptionStatusChange 函数以支持不同的支付方式
const manageSubscriptionStatusChange = async (
  orderId: string,
  customerId: string,
  createAction = false,
  paymentMethod: 'stripe' | 'alipay' | 'wechat' = 'stripe'
) => {
  // 根据支付方式处理不同的逻辑
  switch (paymentMethod) {
    case 'alipay':
      // 处理支付宝支付逻辑
      break;
    case 'wechat':
      // 处理微信支付逻辑
      break;
    default:
      // 原有的 Stripe 逻辑
      break;
  }
  
  // 其余代码保持不变...
};
```

## 注意事项

1. **合规性**：确保你的应用符合中国的支付相关法规要求
2. **测试环境**：使用支付平台提供的沙箱环境进行测试
3. **证书管理**：妥善保管支付密钥和证书文件
4. **错误处理**：完善支付过程中的错误处理机制
5. **日志记录**：详细记录支付过程中的关键信息
6. **退款处理**：实现退款接口以处理用户退款请求

## 部署建议

1. 确保服务器可以访问支付平台的回调接口
2. 配置 HTTPS 证书（大多数支付平台要求 HTTPS）
3. 设置合适的超时时间处理网络延迟
4. 实现重试机制处理网络异常情况

通过以上修改，你就可以将项目从 Stripe 迁移至中国的支付方式，更好地服务国内用户。