// Sandbox Payment Provider - For Development/Testing
import type { 
  PaymentProvider, 
  InitiatePaymentInput, 
  InitiatePaymentResult, 
  PaymentStatusResult,
  VerifiedPaymentEvent,
  WebhookRequest
} from './provider';

export class SandboxPaymentProvider implements PaymentProvider {
  name = 'sandbox';
  
  private simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }
  
  async initiateCollection(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    await this.simulateDelay();
    
    // Generate a fake provider reference
    const providerReference = `SANDBOX_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Store pending payment in memory (in production, this would be in the database)
    console.log('[Sandbox] Payment initiated:', {
      amount: input.amount,
      currency: input.currency,
      phone: input.phoneNumber,
      reference: input.reference,
      providerReference,
    });
    
    return {
      success: true,
      providerReference,
      checkoutUrl: `/sandbox-payment?ref=${providerReference}`,
    };
  }
  
  async getTransactionStatus(reference: string): Promise<PaymentStatusResult> {
    await this.simulateDelay();
    
    // In sandbox mode, we return pending by default
    // The actual status would be updated via webhook
    return {
      success: true,
      status: 'pending',
      providerReference: reference,
    };
  }
  
  async verifyWebhook(request: WebhookRequest): Promise<VerifiedPaymentEvent> {
    const body = request.body as any;
    
    // In sandbox, accept any valid-looking webhook
    if (!body.provider_reference && !body.reference) {
      throw new Error('Invalid sandbox webhook: missing reference');
    }
    
    return {
      provider: 'sandbox',
      eventType: body.event_type || 'payment_success',
      providerReference: body.provider_reference || body.reference || '',
      amount: body.amount || 0,
      currency: body.currency || 'XAF',
      status: body.status === 'failed' ? 'failed' : 
              body.status === 'cancelled' ? 'cancelled' : 'successful',
      metadata: body.metadata || {},
    };
  }
}

// Simulate successful payment (for testing)
export async function simulateSandboxPayment(providerReference: string): Promise<void> {
  console.log(`[Sandbox] Simulating successful payment for ${providerReference}`);
  // In a real implementation, this would trigger a webhook
}

// Simulate failed payment (for testing)
export async function simulateSandboxPaymentFailure(
  providerReference: string, 
  reason: string
): Promise<void> {
  console.log(`[Sandbox] Simulating failed payment for ${providerReference}: ${reason}`);
}
