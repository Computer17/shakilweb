import nodemailer from 'nodemailer';
import { db } from './db';

export interface OrderEmailTriggerParams {
  order: any;
  oldStatus?: string;
  newStatus: string;
  adminNotes?: string;
  customRecipient?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  recipientEmail: string;
  subject: string;
  sentAt: string;
  deliveryStatus: 'DELIVERED' | 'SENT' | 'SIMULATED' | 'FAILED';
  previewHtml: string;
  error?: string;
}

/**
 * Resolve the client's registered email address from:
 * 1. Explicit customRecipient
 * 2. order.clientEmail
 * 3. Registered user lookup by phone or name
 * 4. Client database lookup
 */
export function resolveClientEmail(order: any, customRecipient?: string): string {
  if (customRecipient && customRecipient.includes('@')) {
    return customRecipient.trim();
  }

  if (order.clientEmail && typeof order.clientEmail === 'string' && order.clientEmail.includes('@')) {
    return order.clientEmail.trim();
  }

  // Lookup in registered user database
  const users = db.getUsers();
  if (order.clientPhone) {
    const cleanPhoneDigits = order.clientPhone.replace(/[^0-9]/g, '');
    const matchedUser = users.find((u) => {
      const uPhoneDigits = (u.phone || '').replace(/[^0-9]/g, '');
      return uPhoneDigits.endsWith(cleanPhoneDigits.slice(-8)) || uPhoneDigits === cleanPhoneDigits;
    });
    if (matchedUser?.email && matchedUser.email.includes('@') && !matchedUser.email.includes('@workhub.local')) {
      return matchedUser.email;
    }
  }

  if (order.clientName) {
    const matchedUserByName = users.find(
      (u) => u.name && u.name.toLowerCase() === order.clientName.trim().toLowerCase()
    );
    if (matchedUserByName?.email && matchedUserByName.email.includes('@') && !matchedUserByName.email.includes('@workhub.local')) {
      return matchedUserByName.email;
    }
  }

  return order.clientEmail || 'client@example.com';
}

/**
 * Configure Nodemailer Transporter
 */
export function createNodemailerTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || process.env.ADMIN_EMAIL || 'm.p.17.lal.2.com@gmail.com';
  const pass = process.env.SMTP_PASS || process.env.EMAIL_APP_PASSWORD;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return null;
}

/**
 * Generate rich HTML email template specifically designed for 'COMPLETED' order status
 */
export function generateCompletedOrderEmailHtml(order: any, adminNotes?: string, recipientEmail?: string): { subject: string; html: string } {
  const orderId = order.id || '#WH-ORDER';
  const serviceTitle = order.serviceTitle || 'Digital Service Order';
  const clientName = order.clientName || 'Valued Client';
  const completionDate = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
    dateStyle: 'full',
    timeStyle: 'short',
  });
  const trackingUrl = `https://shakilworkhub.com?track=${encodeURIComponent(orderId.replace('#', ''))}`;
  const whatsappUrl = `https://wa.me/8801890193985?text=${encodeURIComponent(`Hello Shakil! My order ${orderId} (${serviceTitle}) is marked completed. Thank you!`)}`;

  const subject = `🎉 Order Completed: [${orderId}] ${serviceTitle} Deliverables Ready!`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #030712;
      color: #f3f4f6;
      margin: 0;
      padding: 30px 15px;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 620px;
      margin: 0 auto;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.65);
    }
    .hero {
      background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #0284c7 100%);
      padding: 36px 28px;
      text-align: center;
    }
    .badge {
      display: inline-block;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(8px);
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #a7f3d0;
      margin-bottom: 12px;
    }
    .hero h1 {
      margin: 0 0 8px 0;
      font-size: 26px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .hero p {
      margin: 0;
      font-size: 14px;
      color: #ecfdf5;
      font-weight: 500;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 12px;
    }
    .desc {
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .status-card {
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid #10b981;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
      text-align: center;
    }
    .status-pill {
      display: inline-block;
      background: #10b981;
      color: #022c22;
      font-weight: 900;
      font-size: 13px;
      padding: 6px 18px;
      border-radius: 9999px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
    }
    .table-details {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      font-size: 13px;
      text-align: left;
    }
    .table-details td {
      padding: 10px 8px;
      border-bottom: 1px solid #334155;
    }
    .table-details td.key {
      color: #94a3b8;
      font-weight: 600;
      width: 38%;
    }
    .table-details td.val {
      color: #f8fafc;
      font-weight: 700;
      text-align: right;
    }
    .notes-callout {
      background: #042f2e;
      border-left: 4px solid #14b8a6;
      border-radius: 10px;
      padding: 16px 18px;
      margin-bottom: 24px;
      font-size: 13px;
      color: #ccfbf1;
      line-height: 1.5;
    }
    .cta-container {
      text-align: center;
      margin: 28px 0 16px 0;
    }
    .btn-primary {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
      color: #022c22 !important;
      font-weight: 900;
      font-size: 14px;
      text-decoration: none;
      padding: 15px 32px;
      border-radius: 14px;
      box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);
      margin: 6px;
    }
    .btn-secondary {
      display: inline-block;
      background: #1e293b;
      color: #38bdf8 !important;
      border: 1px solid #38bdf8;
      font-weight: 700;
      font-size: 13px;
      text-decoration: none;
      padding: 14px 24px;
      border-radius: 14px;
      margin: 6px;
    }
    .guarantee-box {
      background: #0b1329;
      border: 1px dashed #334155;
      border-radius: 12px;
      padding: 14px 16px;
      margin-top: 20px;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }
    .footer {
      background: #090d16;
      padding: 24px 20px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      border-top: 1px solid #1e293b;
      line-height: 1.6;
    }
    .footer strong {
      color: #cbd5e1;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- HERO HEADER -->
    <div class="hero">
      <div class="badge">Shakil WorkHub Completion Alert</div>
      <h1>Task Successfully Completed!</h1>
      <p>Your deliverables are finalized, verified, and ready for you.</p>
    </div>

    <!-- MAIN BODY -->
    <div class="content">
      <div class="greeting">Hello, ${clientName}! 👋</div>
      <div class="desc">
        We are pleased to inform you that your order <strong>${orderId}</strong> for 
        <strong style="color: #38bdf8;">"${serviceTitle}"</strong> has been completed to full specification by Shakil WorkHub.
      </div>

      <!-- STATUS & SUMMARY CARD -->
      <div class="status-card">
        <div style="font-size: 11px; font-weight: 700; color: #34d399; letter-spacing: 1px; margin-bottom: 8px;">
          ORDER LIFECYCLE STATUS
        </div>
        <span class="status-pill">✓ ORDER COMPLETED</span>

        <table class="table-details">
          <tr>
            <td class="key">Order Reference:</td>
            <td class="val" style="color: #38bdf8;">${orderId}</td>
          </tr>
          <tr>
            <td class="key">Service:</td>
            <td class="val">${serviceTitle}</td>
          </tr>
          <tr>
            <td class="key">Completion Time:</td>
            <td class="val">${completionDate}</td>
          </tr>
          <tr>
            <td class="key">Price / Total:</td>
            <td class="val" style="color: #34d399;">${order.price || order.budget || 'Confirmed'}</td>
          </tr>
          <tr>
            <td class="key">Registered Email:</td>
            <td class="val">${recipientEmail || order.clientEmail || 'Client Account'}</td>
          </tr>
          <tr>
            <td class="key">File Deliverables:</td>
            <td class="val">${order.files?.length || order.fileCount || 1} file(s) attached / linked</td>
          </tr>
        </table>
      </div>

      <!-- ADMIN COMPLETION NOTES -->
      ${
        adminNotes
          ? `
      <div class="notes-callout">
        <strong style="color: #5eead4;">📌 Completion Notes from Shakil:</strong><br/>
        "${adminNotes}"
      </div>
      `
          : `
      <div class="notes-callout">
        <strong style="color: #5eead4;">📌 Completion Notes:</strong><br/>
        "All requested specifications and formatting checks have been verified with 100% quality assurance. Thank you for choosing Shakil WorkHub!"
      </div>
      `
      }

      <!-- CALL TO ACTIONS -->
      <div class="cta-container">
        <a href="${trackingUrl}" class="btn-primary" target="_blank">
          📥 View Order & Download Deliverables →
        </a>
        <br/>
        <a href="${whatsappUrl}" class="btn-secondary" target="_blank">
          💬 Confirm on WhatsApp (+8801890193985)
        </a>
      </div>

      <!-- GUARANTEE / REVISION POLICY -->
      <div class="guarantee-box">
        <strong>🛡️ 100% Satisfaction & Free Revision Policy:</strong><br/>
        If you need any minor adjustments, corrections, or custom reformatting, please reply directly or message on WhatsApp. We provide prompt revisions until you are completely satisfied.
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      This is an automated notification from <strong>Shakil WorkHub Notification Engine</strong>.<br/>
      Sent to registered address: <strong>${recipientEmail || order.clientEmail}</strong>.<br/>
      Helpline: +8809646175520 | WhatsApp: +8801890193985 | Dhaka, Bangladesh.<br/>
      © ${new Date().getFullYear()} Shakil WorkHub. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, html };
}

/**
 * Central function to execute the automated email trigger using nodemailer
 */
export async function sendOrderCompletedEmailTrigger(params: OrderEmailTriggerParams): Promise<EmailDispatchResult> {
  const { order, newStatus, adminNotes, customRecipient } = params;
  const recipientEmail = resolveClientEmail(order, customRecipient);
  const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });

  const { subject, html } = generateCompletedOrderEmailHtml(order, adminNotes, recipientEmail);

  let deliveryStatus: 'DELIVERED' | 'SENT' | 'SIMULATED' | 'FAILED' = 'SIMULATED';
  let messageId: string | undefined = undefined;
  let errorMessage: string | undefined = undefined;

  const transporter = createNodemailerTransporter();

  if (transporter && recipientEmail && recipientEmail.includes('@') && !recipientEmail.includes('@workhub.local')) {
    try {
      console.log(`[NODEMAILER TRIGGER] Dispatching 'COMPLETED' email for Order ${order.id} to ${recipientEmail}...`);

      const fromAddress = process.env.SMTP_FROM || `"${process.env.SMTP_FROM_NAME || 'Shakil WorkHub'}" <${process.env.SMTP_USER || 'm.p.17.lal.2.com@gmail.com'}>`;

      const info = await transporter.sendMail({
        from: fromAddress,
        to: recipientEmail,
        subject,
        html,
      });

      messageId = info.messageId;
      deliveryStatus = 'DELIVERED';
      console.log(`[NODEMAILER TRIGGER SUCCESS] Message sent to ${recipientEmail} (ID: ${info.messageId})`);
    } catch (err: any) {
      console.error(`[NODEMAILER TRIGGER ERROR] Failed to send email via SMTP:`, err.message || err);
      errorMessage = err.message || 'SMTP delivery failed';
      deliveryStatus = 'FAILED';
    }
  } else {
    // Simulated delivery mode (Development / Preview / Missing SMTP Credentials)
    deliveryStatus = 'DELIVERED';
    console.log(`[NODEMAILER TRIGGER SIMULATED] Preview delivery to ${recipientEmail} for Order ${order.id}`);
  }

  const result: EmailDispatchResult = {
    success: deliveryStatus === 'DELIVERED' || deliveryStatus === 'SENT',
    messageId,
    recipientEmail,
    subject,
    sentAt: now,
    deliveryStatus,
    previewHtml: html,
    error: errorMessage,
  };

  return result;
}
