import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  
  return resendClient;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const DEFAULT_FROM = process.env.EMAIL_FROM || 'Empire Lounge <noreply@empire-lounge.com>';

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const resend = getResendClient();
  
  if (!resend) {
    console.warn('Resend API key not configured. Email not sent.');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: options.from || DEFAULT_FROM,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(',') : options.cc) : undefined,
      bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(',') : options.bcc) : undefined,
    });

    if (error) {
      console.error('Resend email error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (err) {
    console.error('Email send exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error sending email',
    };
  }
}

export async function sendTemplatedEmail(
  to: string | string[],
  subject: string,
  template: string,
  variables: Record<string, string>
): Promise<EmailResult> {
  let html = template;
  
  // Replace variables in format {{variableName}}
  Object.entries(variables).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  return sendEmail({ to, subject, html });
}
