// Payment Provider Interface

export interface WebhookRequest {
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
}

export interface InitiatePaymentInput {
  amount: number;
  currency: string;
  phoneNumber: string;
  reference: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface InitiatePaymentResult {
  success: boolean;
  providerReference?: string;
  checkoutUrl?: string;
  error?: string;
  errorCode?: string;
}

export interface PaymentStatusResult {
  success: boolean;
  status: 'pending' | 'successful' | 'failed' | 'cancelled';
  providerReference?: string;
  error?: string;
}

export interface VerifiedPaymentEvent {
  provider: string;
  eventType: string;
  providerReference: string;
  amount: number;
  currency: string;
  status: 'successful' | 'failed' | 'cancelled';
  metadata?: Record<string, unknown>;
}

export interface PaymentProvider {
  name: string;
  
  initiateCollection(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  
  getTransactionStatus(reference: string): Promise<PaymentStatusResult>;
  
  verifyWebhook(request: WebhookRequest): Promise<VerifiedPaymentEvent>;
}
