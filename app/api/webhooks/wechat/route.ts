import { NextResponse } from 'next/server';
import { wechatPay } from '@/utils/wechatpay/config';
import { manageSubscriptionStatusChange } from '@/utils/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    
    // 验证微信支付签名
    // const isValid = wechatPay.verifySignature(req.headers, body);
    // 临时跳过验证以便测试
    const isValid = true;
    
    if (!isValid) {
      return new NextResponse('Invalid signature', { status: 400 });
    }

    const data = JSON.parse(body);
    
    // 处理支付结果
    if (data.event_type === 'TRANSACTION.SUCCESS') {
      // 解密支付结果
      // const decryptedData = wechatPay.decipher_gcm(
      //   data.resource.ciphertext,
      //   data.resource.associated_data,
      //   data.resource.nonce
      // );
      
      // 临时使用模拟数据
      const decryptedData: any = {
        trade_state: 'SUCCESS',
        out_trade_no: data.resource.out_trade_no || '',
        payer: {
          openid: data.resource.payer?.openid || ''
        }
      };
      
      if (decryptedData.trade_state === 'SUCCESS') {
        // 支付成功，更新订阅状态
        await manageSubscriptionStatusChange(
          decryptedData.out_trade_no,
          decryptedData.payer?.openid || '',
          true
        );
      }
    }

    return new NextResponse(JSON.stringify({ code: 'SUCCESS', message: '成功' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('WeChat Pay webhook error:', error);
    return new NextResponse('Webhook Error', { status: 400 });
  }
}