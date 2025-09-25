import WeChatPay from 'wechatpay-node-v3';

const config = {
  appid: process.env.WECHAT_PAY_APP_ID || '',
  mchid: process.env.WECHAT_PAY_MCH_ID || '',
  privateKey: process.env.WECHAT_PAY_PRIVATE_KEY ? Buffer.from(process.env.WECHAT_PAY_PRIVATE_KEY.replace(/\\n/g, '\n')) : Buffer.from(''),
  serial_no: process.env.WECHAT_PAY_SERIAL_NO || '',
  publicKey: Buffer.from('') // 占位符，实际使用时会从证书中提取
};

export const wechatPay = new WeChatPay(config);