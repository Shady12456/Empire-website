import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail, contactFormNotificationTemplate } from '@/lib/email';
import { rateLimitByKey } from '@/lib/rate-limit';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(2, 'Subject must be at least 2 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  locale: z.enum(['en', 'fr']).default('en'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimitByKey({
      key: `contact:${ip}`,
      limit: 5,
      window: 60000, // 5 requests per minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validationResult = contactSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, subject, message, locale } = validationResult.data;

    // Send notification to business email
    const html = contactFormNotificationTemplate({
      locale,
      subject: `Contact Form: ${subject}`,
      senderName: name,
      senderEmail: email,
      message,
    });

    const result = await sendEmail({
      to: process.env.CONTACT_EMAIL || 'info@empire-lounge.com',
      subject: `New Contact: ${subject} from ${name}`,
      html,
      replyTo: email,
    });

    if (!result.success) {
      console.error('Failed to send contact form email:', result.error);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again.' },
        { status: 500 }
      );
    }

    // Send confirmation to sender (optional - can be disabled)
    if (process.env.SEND_CONTACT_CONFIRMATION === 'true') {
      const confirmationHtml = locale === 'fr'
        ? `
          <h2>Merci pour votre message!</h2>
          <p>Bonjour ${name},</p>
          <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
          <p><strong>Résumé de votre message:</strong></p>
          <p><strong>Sujet:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <p>Cordialement,<br>L'équipe Empire Lounge</p>
        `
        : `
          <h2>Thank you for your message!</h2>
          <p>Hello ${name},</p>
          <p>We have received your message and will respond as soon as possible.</p>
          <p><strong>Summary of your message:</strong></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <p>Best regards,<br>The Empire Lounge Team</p>
        `;

      await sendEmail({
        to: email,
        subject: locale === 'fr' ? 'Nous avons reçu votre message' : 'We received your message',
        html: confirmationHtml,
        from: process.env.EMAIL_FROM || 'noreply@empire-lounge.com',
      });
    }

    return NextResponse.json({
      success: true,
      message: locale === 'fr' 
        ? 'Message envoyé avec succès!'
        : 'Message sent successfully!'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
