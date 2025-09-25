'use client';

// 微信支付客户端函数
export const initializeWeChatPay = (paymentParams: any) => {
  // 这里可以添加微信支付的客户端初始化逻辑
  // 例如加载微信支付 JS SDK 等
  return Promise.resolve();
};

// 检查是否在微信浏览器中
export const isWeChatBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('micromessenger');
};