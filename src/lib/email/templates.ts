// Email Templates for Empire Lounge

export const baseTemplate = `
<!DOCTYPE html>
<html lang="{{locale}}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f6f9;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-wrapper {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background-color: #0b0c10;
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header .subtitle {
      color: #ff0055;
      font-size: 14px;
      margin-top: 5px;
    }
    .content {
      padding: 30px 20px;
    }
    .button {
      display: inline-block;
      background-color: #ff0055;
      color: #ffffff !important;
      padding: 12px 24px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 600;
      margin: 10px 0;
    }
    .button-secondary {
      background-color: #00f0ff;
      color: #0b0c10 !important;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #ff0055;
      padding: 15px;
      margin: 20px 0;
      border-radius: 0 4px 4px 0;
    }
    .info-box h3 {
      margin-top: 0;
      color: #0b0c10;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .footer a {
      color: #ff0055;
      text-decoration: none;
    }
    .qr-code {
      background-color: #ffffff;
      padding: 20px;
      text-align: center;
      border: 1px solid #eee;
      margin: 20px 0;
    }
    .order-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .order-total {
      font-weight: bold;
      font-size: 18px;
      padding-top: 10px;
      border-top: 2px solid #0b0c10;
    }
    @media only screen and (max-width: 480px) {
      .container {
        padding: 10px;
      }
      .content {
        padding: 20px 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>Empire Lounge</h1>
        <div class="subtitle">{{tagline}}</div>
      </div>
      <div class="content">
        {{content}}
      </div>
      <div class="footer">
        <p>{{address}}</p>
        <p>{{phone}} | {{email}}</p>
        <p>&copy; {{year}} Empire Lounge. {{rights}}</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Order Confirmation Template
export function orderConfirmationTemplate(data: {
  locale: string;
  subject: string;
  orderNumber: string;
  customerName: string;
  orderType: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  subtotal: string;
  total: string;
  estimatedTime: string;
  notes?: string;
}): string {
  const isFrench = data.locale === 'fr';
  
  const itemsHtml = data.items
    .map(
      (item) => `
      <div class="order-item">
        <span>${item.quantity}x ${item.name}</span>
        <span>${item.price}</span>
      </div>
    `
    )
    .join('');

  const content = `
    <h2>${isFrench ? 'Confirmation de Commande' : 'Order Confirmation'}</h2>
    <p>${isFrench ? 'Bonjour' : 'Hello'} ${data.customerName},</p>
    <p>${isFrench ? 'Votre commande a été confirmée!' : 'Your order has been confirmed!'}</p>
    
    <div class="info-box">
      <h3>${isFrench ? 'Détails de la Commande' : 'Order Details'}</h3>
      <p><strong>${isFrench ? 'Numéro de Commande' : 'Order Number'}:</strong> #${data.orderNumber}</p>
      <p><strong>${isFrench ? 'Type' : 'Type'}:</strong> ${data.orderType}</p>
      <p><strong>${isFrench ? 'Temps Estimé' : 'Estimated Time'}:</strong> ${data.estimatedTime}</p>
    </div>
    
    <h3>${isFrench ? 'Articles Commandés' : 'Order Items'}</h3>
    ${itemsHtml}
    <div class="order-item order-total">
      <span>${isFrench ? 'Total' : 'Total'}</span>
      <span>${data.total}</span>
    </div>
    
    ${data.notes ? `<p><strong>${isFrench ? 'Notes' : 'Notes'}:</strong> ${data.notes}</p>` : ''}
    
    <p style="margin-top: 30px;">
      <a href="{{orderUrl}}" class="button">${isFrench ? 'Voir la Commande' : 'View Order'}</a>
    </p>
  `;

  return baseTemplate
    .replace('{{subject}}', data.subject)
    .replace('{{locale}}', data.locale)
    .replace('{{tagline}}', isFrench ? 'Gastronomie et Vie Nocturne Premium' : 'Fine Dining & Premium Nightlife')
    .replace('{{content}}', content)
    .replace('{{address}}', 'Sappa Road, Opposite Limbe Community Field, Limbe, Cameroon')
    .replace('{{phone}}', '+237 6 00 00 00 00')
    .replace('{{email}}', 'info@empire-lounge.com')
    .replace('{{year}}', new Date().getFullYear().toString())
    .replace('{{rights}}', isFrench ? 'Tous droits réservés.' : 'All rights reserved.');
}

// Event Ticket Template
export function eventTicketTemplate(data: {
  locale: string;
  subject: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  ticketType: string;
  ticketHolder: string;
  qrCodeUrl?: string;
}): string {
  const isFrench = data.locale === 'fr';

  const content = `
    <h2>${isFrench ? 'Votre Billet' : 'Your Ticket'}</h2>
    <p>${isFrench ? 'Bonjour' : 'Hello'} ${data.ticketHolder},</p>
    <p>${isFrench ? 'Voici les détails de votre billet pour' : 'Here are your ticket details for'} <strong>${data.eventName}</strong>.</p>
    
    <div class="info-box">
      <h3>${isFrench ? 'Détails de l\'Événement' : 'Event Details'}</h3>
      <p><strong>${isFrench ? 'Événement' : 'Event'}:</strong> ${data.eventName}</p>
      <p><strong>${isFrench ? 'Date' : 'Date'}:</strong> ${data.eventDate}</p>
      <p><strong>${isFrench ? 'Heure' : 'Time'}:</strong> ${data.eventTime}</p>
      <p><strong>${isFrench ? 'Lieu' : 'Venue'}:</strong> ${data.venue}</p>
      <p><strong>${isFrench ? 'Type de Billet' : 'Ticket Type'}:</strong> ${data.ticketType}</p>
    </div>
    
    ${data.qrCodeUrl ? `
    <div class="qr-code">
      <p>${isFrench ? 'Scannez ce code à l\'entrée' : 'Scan this code at entry'}</p>
      <img src="${data.qrCodeUrl}" alt="QR Code" style="max-width: 200px;" />
    </div>
    ` : ''}
    
    <p><strong>${isFrench ? 'Instructions' : 'Instructions'}:</strong></p>
    <ul>
      <li>${isFrench ? 'Présentez ce billet à l\'entrée' : 'Present this ticket at the entrance'}</li>
      <li>${isFrench ? 'Âge minimum: 18 ans' : 'Minimum age: 18 years'}</li>
      <li>${isFrench ? 'Code de tenue obligatoire' : 'Dress code required'}</li>
    </ul>
  `;

  return baseTemplate
    .replace('{{subject}}', data.subject)
    .replace('{{locale}}', data.locale)
    .replace('{{tagline}}', isFrench ? 'Gastronomie et Vie Nocturne Premium' : 'Fine Dining & Premium Nightlife')
    .replace('{{content}}', content)
    .replace('{{address}}', 'Sappa Road, Opposite Limbe Community Field, Limbe, Cameroon')
    .replace('{{phone}}', '+237 6 00 00 00 00')
    .replace('{{email}}', 'info@empire-lounge.com')
    .replace('{{year}}', new Date().getFullYear().toString())
    .replace('{{rights}}', isFrench ? 'Tous droits réservés.' : 'All rights reserved.');
}

// Reservation Confirmation Template
export function reservationConfirmationTemplate(data: {
  locale: string;
  subject: string;
  eventName: string;
  reservationNumber: string;
  customerName: string;
  tableCode: string;
  guestCount: number;
  depositAmount: string;
  totalAmount: string;
  eventDate: string;
  eventTime: string;
}): string {
  const isFrench = data.locale === 'fr';

  const content = `
    <h2>${isFrench ? 'Confirmation de Réservation' : 'Reservation Confirmation'}</h2>
    <p>${isFrench ? 'Bonjour' : 'Hello'} ${data.customerName},</p>
    <p>${isFrench ? 'Votre réservation a été confirmée!' : 'Your reservation has been confirmed!'}</p>
    
    <div class="info-box">
      <h3>${isFrench ? 'Détails de la Réservation' : 'Reservation Details'}</h3>
      <p><strong>${isFrench ? 'Numéro de Réservation' : 'Reservation Number'}:</strong> #${data.reservationNumber}</p>
      <p><strong>${isFrench ? 'Événement' : 'Event'}:</strong> ${data.eventName}</p>
      <p><strong>${isFrench ? 'Date' : 'Date'}:</strong> ${data.eventDate}</p>
      <p><strong>${isFrench ? 'Heure' : 'Time'}:</strong> ${data.eventTime}</p>
      <p><strong>${isFrench ? 'Table' : 'Table'}:</strong> ${data.tableCode}</p>
      <p><strong>${isFrench ? 'Nombre d\'Invités' : 'Guest Count'}:</strong> ${data.guestCount}</p>
    </div>
    
    <h3>${isFrench ? 'Paiement' : 'Payment'}</h3>
    <div class="order-item">
      <span>${isFrench ? 'Acompte Payé' : 'Deposit Paid'}</span>
      <span>${data.depositAmount}</span>
    </div>
    <div class="order-item order-total">
      <span>${isFrench ? 'Total Dû' : 'Total Due'}</span>
      <span>${data.totalAmount}</span>
    </div>
    
    <p style="margin-top: 30px;">
      <a href="{{reservationUrl}}" class="button">${isFrench ? 'Voir la Réservation' : 'View Reservation'}</a>
    </p>
  `;

  return baseTemplate
    .replace('{{subject}}', data.subject)
    .replace('{{locale}}', data.locale)
    .replace('{{tagline}}', isFrench ? 'Gastronomie et Vie Nocturne Premium' : 'Fine Dining & Premium Nightlife')
    .replace('{{content}}', content)
    .replace('{{address}}', 'Sappa Road, Opposite Limbe Community Field, Limbe, Cameroon')
    .replace('{{phone}}', '+237 6 00 00 00 00')
    .replace('{{email}}', 'info@empire-lounge.com')
    .replace('{{year}}', new Date().getFullYear().toString())
    .replace('{{rights}}', isFrench ? 'Tous droits réservés.' : 'All rights reserved.');
}

// Password Reset Template
export function passwordResetTemplate(data: {
  locale: string;
  subject: string;
  customerName: string;
  resetUrl: string;
  expiresIn: string;
}): string {
  const isFrench = data.locale === 'fr';

  const content = `
    <h2>${isFrench ? 'Réinitialisation du Mot de Passe' : 'Password Reset'}</h2>
    <p>${isFrench ? 'Bonjour' : 'Hello'} ${data.customerName},</p>
    <p>${isFrench ? 'Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.' : 'We received a request to reset the password for your account.'}</p>
    <p>${isFrench ? 'Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe:' : 'Click the button below to reset your password:'}</p>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${data.resetUrl}" class="button">${isFrench ? 'Réinitialiser le Mot de Passe' : 'Reset Password'}</a>
    </p>
    
    <p style="color: #666; font-size: 14px;">
      ${isFrench 
        ? `Ce lien expire dans ${data.expiresIn}. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.`
        : `This link expires in ${data.expiresIn}. If you didn't request this reset, you can ignore this email.`}
    </p>
    
    <p style="color: #666; font-size: 14px;">
      ${isFrench 
        ? 'Pour des raisons de sécurité, ne partagez pas ce lien avec anyone.'
        : 'For security reasons, do not share this link with anyone.'}
    </p>
  `;

  return baseTemplate
    .replace('{{subject}}', data.subject)
    .replace('{{locale}}', data.locale)
    .replace('{{tagline}}', isFrench ? 'Gastronomie et Vie Nocturne Premium' : 'Fine Dining & Premium Nightlife')
    .replace('{{content}}', content)
    .replace('{{address}}', 'Sappa Road, Opposite Limbe Community Field, Limbe, Cameroon')
    .replace('{{phone}}', '+237 6 00 00 00 00')
    .replace('{{email}}', 'info@empire-lounge.com')
    .replace('{{year}}', new Date().getFullYear().toString())
    .replace('{{rights}}', isFrench ? 'Tous droits réservés.' : 'All rights reserved.');
}

// Contact Form Notification Template
export function contactFormNotificationTemplate(data: {
  locale: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  message: string;
}): string {
  const isFrench = data.locale === 'fr';

  const content = `
    <h2>${isFrench ? 'Nouveau Message de Contact' : 'New Contact Message'}</h2>
    
    <div class="info-box">
      <h3>${isFrench ? 'Informations de l\'Expéditeur' : 'Sender Information'}</h3>
      <p><strong>${isFrench ? 'Nom' : 'Name'}:</strong> ${data.senderName}</p>
      <p><strong>${isFrench ? 'Email' : 'Email'}:</strong> ${data.senderEmail}</p>
    </div>
    
    <h3>${isFrench ? 'Message' : 'Message'}</h3>
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${data.message}</div>
  `;

  return baseTemplate
    .replace('{{subject}}', data.subject)
    .replace('{{locale}}', data.locale)
    .replace('{{tagline}}', isFrench ? 'Gastronomie et Vie Nocturne Premium' : 'Fine Dining & Premium Nightlife')
    .replace('{{content}}', content)
    .replace('{{address}}', 'Sappa Road, Opposite Limbe Community Field, Limbe, Cameroon')
    .replace('{{phone}}', '+237 6 00 00 00 00')
    .replace('{{email}}', 'info@empire-lounge.com')
    .replace('{{year}}', new Date().getFullYear().toString())
    .replace('{{rights}}', isFrench ? 'Tous droits réservés.' : 'All rights reserved.');
}
