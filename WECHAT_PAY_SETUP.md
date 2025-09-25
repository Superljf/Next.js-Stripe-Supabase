# 微信支付配置指南

本指南将详细介绍如何配置微信支付功能。

## 1. 注册微信支付商户号

1. 访问 [微信支付商户平台](https://pay.weixin.qq.com/)
2. 点击"立即注册"
3. 填写企业信息并完成认证

## 2. 获取必要参数

在微信支付商户平台获取以下参数：

### 2.1 基本信息
- `WECHAT_PAY_APP_ID`: 公众号或小程序 AppID
- `WECHAT_PAY_MCH_ID`: 商户号

### 2.2 API 密钥
- `WECHAT_PAY_APIV3_PRIVATE_KEY`: APIv3 密钥

### 2.3 证书信息
- `WECHAT_PAY_PRIVATE_KEY`: 商户私钥
- `WECHAT_PAY_SERIAL_NO`: 商户证书序列号

## 3. 配置步骤

### 3.1 生成商户证书
1. 登录微信支付商户平台
2. 进入"账户中心" → "API安全"
3. 申请 API 证书
4. 下载证书文件

### 3.2 获取 APIv3 密钥
1. 在"API安全"页面设置 APIv3 密钥
2. 保存密钥到安全位置

### 3.3 配置支付域名
1. 进入"产品中心" → "开发配置"
2. 配置以下域名：
   - 支付授权目录
   - JSAPI 支付域名
   - Native 支付回调 URL

## 4. 环境变量配置

将以下配置添加到 [.env.local](file:///d:/2025%E4%B8%8B%E5%8D%8A%E5%B9%B4Code/Next.js-Stripe-Supabase/.env.local) 文件：

```bash
# 微信支付配置
WECHAT_PAY_APP_ID=your_app_id
WECHAT_PAY_MCH_ID=your_mch_id
WECHAT_PAY_PRIVATE_KEY=your_private_key
WECHAT_PAY_SERIAL_NO=your_serial_no
WECHAT_PAY_APIV3_PRIVATE_KEY=your_apiv3_private_key
```

## 5. 私钥处理

### 5.1 私钥格式转换
将下载的 `.pem` 私钥文件内容转换为单行字符串：

```bash
# Linux/Mac
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' your_private_key.pem

# Windows PowerShell
(Get-Content your_private_key.pem) -join "\n"
```

### 5.2 环境变量中的私钥
在环境变量中，私钥需要保持换行符：

```bash
WECHAT_PAY_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
```

## 6. 测试支付

### 6.1 沙箱环境
微信支付提供沙箱环境用于测试：
1. 在商户平台开启沙箱模式
2. 使用沙箱密钥和参数进行测试

### 6.2 测试流程
1. 启动开发服务器
2. 访问定价页面
3. 选择产品并点击"微信支付"
4. 扫描生成的二维码完成支付

## 7. 回调处理

### 7.1 支付结果通知
微信支付会向配置的回调 URL 发送支付结果通知：
- URL: `/api/webhooks/wechat`
- 方法: POST

### 7.2 签名验证
系统会自动验证微信支付的签名，确保通知的真实性。

## 8. 常见问题

### 8.1 证书错误
- 确保证书文件正确上传
- 检查证书序列号是否匹配
- 确保证书未过期

### 8.2 签名失败
- 检查 APIv3 密钥是否正确
- 确认时间戳和随机字符串正确生成
- 验证签名算法是否正确实现

### 8.3 回调地址问题
- 确保回调地址可通过公网访问
- 检查防火墙和安全组设置
- 确认 SSL 证书有效

通过以上配置，你的应用就可以支持微信支付功能了。