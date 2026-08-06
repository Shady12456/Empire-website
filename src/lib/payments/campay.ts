// CamPay Payment Provider
import crypto from 'crypto';
import type { 
  PaymentProvider, 
  InitiatePaymentInput, 
  InitiatePaymentResult, 
  PaymentStatusResult,
  VerifiedPaymentEvent,
  WebhookRequest 
} from './provider';

interface CamPayConfig {
  apiBaseUrl: string;
  apiKey: string;
  username: string;
  password: string;
  webhookSecret: string;
}

interface CamPayTokenResponse {
  token: string;
}

interface CamPayCollectionResponse {
  reference: string;
  status: string;
  message: string;
}

interface CamPayTransactionResponse {
  reference: string;
  status: string;
  amount: string;
  currency: string;
  checkout_url?: string;
}

export class CamPayPaymentProvider implements PaymentProvider {
  name = 'campay';
  private config: CamPayConfig;
  
  constructor() {
    this.config = {
      apiBaseUrl: process.env.PAYMENT_API_BASE_URL || 'https://api.campay.net',
      apiKey: process.env.PAYMENT_API_KEY || '',
      username: process.env.PAYMENT_API_USERNAME || '',
      password: process.env.PAYMENT_API_PASSWORD || '',
      webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
    };
  }
  
  private async getToken(): Promise<string> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.config.username,
        password: this.config.password,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to authenticate with CamPay');
    }
    
    const data: CamPayTokenResponse = await response.json();
    return data.token;
  }
  
  async initiateCollection(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    try {
      const token = await this.getToken();
      
      const response = await fetch(`${this.config.apiBaseUrl}/api/collect/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          amount: input.amount / 100, // CamPay uses XAF, not centimes
          currency: input.currency,
          phone_number: input.phoneNumber,
          external_reference: input.reference,
          description: input.description || 'Empire Lounge Payment',
          redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/complete`,
          webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/payments/campay`,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.message || 'Payment initiation failed',
          errorCode: error.code,
        };
      }
      
      const data: CamPayCollectionResponse = await response.json();
      
      return {
        success: true,
        providerReference: data.reference,
        checkoutUrl: data.status === 'SUCCESS' ? undefined : data.status,
      };
    } catch (error) {
      console.error('CamPay payment initiation error:', error);
      return {
        success: false,
        error: 'Failed to initiate payment',
      };
    }
  }
  
  async getTransactionStatus(reference: string): Promise<PaymentStatusResult> {
    try {
      const token = await this.getToken();
      
      const response = await fetch(
        `${this.config.apiBaseUrl}/api/transaction/${reference}/`,
        {
          headers: {
            'Authorization': `Token ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        return {
          success: false,
          status: 'failed',
          error: 'Failed to get transaction status',
        };
      }
      
      const data: CamPayTransactionResponse = await response.json();
      
      let status: 'pending' | 'successful' | 'failed' | 'cancelled' = 'pending';
      
      if (data.status === 'SUCCESS' || data.status === 'COMPLETED') {
        status = 'successful';
      } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
        status = data.status === 'CANCELLED' ? 'cancelled' : 'failed';
      }
      
      return {
        success: true,
        status,
        providerReference: data.reference,
      };
    } catch (error) {
      console.error('CamPay status check error:', error);
      return {
        success: false,
        status: 'failed',
        error: 'Failed to check transaction status',
      };
    }
  }
  
  async verifyWebhook(request: WebhookRequest): Promise<VerifiedPaymentEvent> {
    // Verify signature if provided
    const signature = request.headers['x-campay-signature'] as string;
    
    if (signature && this.config.webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(JSON.stringify(request.body))
        .digest('hex');
      
      if (signature !== expectedSignature) {
        throw new Error('Invalid CamPay webhook signature');
      }
    }
    
    const body = request.body as any;
    
    // Map CamPay status to our status
    let status: 'successful' | 'failed' | 'cancelled' = 'failed';
    
    if (body.status === 'SUCCESS' || body.status === 'COMPLETED') {
      status = 'successful';
    } else if (body.status === 'FAILED' || body.status === 'CANCELLED') {
      status = body.status === 'CANCELLED' ? 'cancelled' : 'failed';
    }
    
    return {
      provider: 'campay',
      eventType: body.event_type || 'payment_status_change',
      providerReference: body.reference || body.transaction_reference || '',
      amount: (parseFloat(body.amount || '0') * 100), // Convert to centimes
      currency: body.currency || 'XAF',
      status,
      metadata: {
        operator: body.operator,
        operator_reference: body.operator_reference,
      },
    };
  }
}

// Factory function to get the appropriate payment provider
export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER || 'sandbox';
  
  switch (provider) {
    case 'campay':
      return new CamPayPaymentProvider();
    case 'sandbox':
    default:
      // Return sandbox provider for development
      // Dynamic import to avoid issues when module not installed
      const { SandboxPaymentProvider } = require('./sandbox');
      return new SandboxPaymentProvider();
  }
}
