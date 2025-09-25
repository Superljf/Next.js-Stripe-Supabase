'use server';

import { wechatPay } from '@/utils/wechatpay/config';
import { createClient } from '@/utils/supabase/server';
import { createOrRetrieveCustomer } from '@/utils/supabase/admin';
import { getURL, getErrorRedirect } from '@/utils/helpers';
import { Tables } from '@/types_db';

type Price = Tables<'prices'>;

type CheckoutResponse = {
  errorRedirect?: string;
  codeUrl?: string;
  appId?: string;
  timeStamp?: string;
  nonceStr?: string;
  package?: string;
  signType?: string;
  paySign?: string;
};

export async function checkoutWithWeChatPay(
  price: Price,
  redirectPath: string = '/account'
): Promise<CheckoutResponse> {
  try {
    // 获取用户信息
    const supabase = createClient();
    const {
      error,
      data: { user }
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error(error);
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
      console.error(err);
      throw new Error('Unable to access customer record.');
    }

    // 构造订单号
    const outTradeNo = `order_${Date.now()}_${user.id.substring(0, 8)}`;

    // Native 支付（生成二维码）
    const params = {
      description: 'Payment',
      out_trade_no: outTradeNo,
      amount: {
        total: price.unit_amount || 0,
        currency: 'CNY'
      },
      notify_url: getURL('/api/webhooks/wechat')
    };

    const result: any = await wechatPay.transactions_native(params);
    
    return {
      codeUrl: result.code_url || ''
    };
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