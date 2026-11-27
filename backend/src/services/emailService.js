import nodemailer from 'nodemailer';

// ── Create SMTP transporter (Hostinger)
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true, // SSL on port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ── Shared email sender
async function sendEmail({ to, subject, html, replyTo }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP not configured — email not sent');
    return { success: false, reason: 'SMTP not configured' };
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Kustom Koats" <${process.env.SMTP_USER}>`,
    to: to || process.env.RECEIVER_EMAIL || process.env.SMTP_USER,
    replyTo: replyTo || undefined,
    subject,
    html,
  });

  console.log(`✅ Email sent: "${subject}" → ${to}`);
  return { success: true };
}

// ── Contact form email (sent to admin)
export async function sendContactEmail({ name, email, phone, subject, message }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
      <div style="background: #CA2A31; padding: 24px 32px;">
        <h1 style="color: #fff; margin: 0; font-size: 20px;">New Contact Form Submission</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Kustom Koats Website</p>
      </div>
      <div style="padding: 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 120px; font-size: 14px;">Name</td><td style="padding: 8px 0; color: #000; font-weight: 600; font-size: 14px;">${name}</td></tr>
          <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Email</td><td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #CA2A31;">${email}</a></td></tr>
          ${phone ? `<tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Phone</td><td style="padding: 8px 0; color: #000; font-size: 14px;">${phone}</td></tr>` : ''}
          <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Subject</td><td style="padding: 8px 0; color: #000; font-weight: 600; font-size: 14px;">${subject}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 20px 0;" />
        <h3 style="color: #000; margin: 0 0 12px; font-size: 15px;">Message</h3>
        <p style="color: #333; line-height: 1.6; margin: 0; font-size: 14px;">${message.replace(/\n/g, '<br>')}</p>
      </div>
      <div style="background: #fafafa; padding: 16px 32px; border-top: 1px solid #f0f0f0;">
        <p style="color: #aaa; font-size: 12px; margin: 0;">This message was submitted via the contact form on kustomkoats.in</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: process.env.RECEIVER_EMAIL || process.env.SMTP_USER,
    subject: `Contact: ${subject} — from ${name}`,
    html,
    replyTo: `${name} <${email}>`,
  });
}

// ── Contact confirmation email (sent to customer)
export async function sendContactConfirmation({ name, email, subject }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
      <div style="background: #000; padding: 24px 32px;">
        <h1 style="color: #fff; margin: 0; font-size: 22px; letter-spacing: 1px;">KUSTOM KOATS</h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #000; margin: 0 0 16px; font-size: 20px;">Thanks for reaching out, ${name}!</h2>
        <p style="color: #555; line-height: 1.6; margin: 0 0 16px; font-size: 14px;">
          We've received your message regarding "<strong>${subject}</strong>" and will get back to you within 24 hours.
        </p>
        <p style="color: #555; line-height: 1.6; margin: 0; font-size: 14px;">
          In the meantime, feel free to explore our products at <a href="https://kustomkoats.in" style="color: #CA2A31;">kustomkoats.in</a>
        </p>
      </div>
      <div style="background: #CA2A31; padding: 16px 32px;">
        <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0;">© Kustom Koats — kustomkoats.in</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `We received your message — Kustom Koats`,
    html,
  });
}

// ── Enquiry email (sent to admin)
export async function sendEnquiryEmail({ name, email, phone, message, productName }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
      <div style="background: #CA2A31; padding: 24px 32px;">
        <h1 style="color: #fff; margin: 0; font-size: 20px;">New Product Enquiry</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Kustom Koats Website</p>
      </div>
      <div style="padding: 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 120px; font-size: 14px;">Name</td><td style="padding: 8px 0; color: #000; font-weight: 600; font-size: 14px;">${name}</td></tr>
          <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Email</td><td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #CA2A31;">${email}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Phone</td><td style="padding: 8px 0; color: #000; font-size: 14px;">${phone}</td></tr>
          ${productName ? `<tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Product</td><td style="padding: 8px 0; color: #000; font-weight: 600; font-size: 14px;">${productName}</td></tr>` : ''}
        </table>
        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 20px 0;" />
        <h3 style="color: #000; margin: 0 0 12px; font-size: 15px;">Message</h3>
        <p style="color: #333; line-height: 1.6; margin: 0; font-size: 14px;">${message.replace(/\n/g, '<br>')}</p>
      </div>
      <div style="background: #fafafa; padding: 16px 32px; border-top: 1px solid #f0f0f0;">
        <p style="color: #aaa; font-size: 12px; margin: 0;">This enquiry was submitted via kustomkoats.in</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: process.env.RECEIVER_EMAIL || process.env.SMTP_USER,
    subject: `Enquiry${productName ? ` about ${productName}` : ''} — from ${name}`,
    html,
    replyTo: `${name} <${email}>`,
  });
}

// ── Enquiry confirmation (sent to customer)
export async function sendEnquiryConfirmation({ name, email, productName }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
      <div style="background: #000; padding: 24px 32px;">
        <h1 style="color: #fff; margin: 0; font-size: 22px; letter-spacing: 1px;">KUSTOM KOATS</h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #000; margin: 0 0 16px; font-size: 20px;">Enquiry Received, ${name}!</h2>
        <p style="color: #555; line-height: 1.6; margin: 0 0 16px; font-size: 14px;">
          ${productName
            ? `Thank you for your interest in <strong>${productName}</strong>. Our team will contact you shortly with pricing and availability.`
            : `Thank you for your enquiry. Our team will contact you shortly.`
          }
        </p>
        <p style="color: #555; line-height: 1.6; margin: 0; font-size: 14px;">
          Explore more at <a href="https://kustomkoats.in" style="color: #CA2A31;">kustomkoats.in</a>
        </p>
      </div>
      <div style="background: #CA2A31; padding: 16px 32px;">
        <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0;">© Kustom Koats — kustomkoats.in</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Your enquiry received — Kustom Koats`,
    html,
  });
}

// ── Order confirmation email
export async function sendOrderConfirmationEmail({ name, email, orderId, items, total, address }) {
  const itemRows = (items || []).map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #000;">${item.name}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #555; text-align: center;">×${item.quantity}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #000; text-align: right; font-weight: 600;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
      <div style="background: #000; padding: 24px 32px;">
        <h1 style="color: #fff; margin: 0; font-size: 22px; letter-spacing: 1px;">KUSTOM KOATS</h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #000; margin: 0 0 8px; font-size: 20px;">Order Confirmed!</h2>
        <p style="color: #555; margin: 0 0 24px; font-size: 14px;">Hi ${name}, your order has been received and is being processed.</p>
        
        <div style="background: #f8f8f8; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 13px; color: #888;">Order ID</p>
          <p style="margin: 4px 0 0; font-size: 16px; font-weight: 700; color: #CA2A31;">#${orderId}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8f8f8;">
              <th style="padding: 10px; text-align: left; font-size: 12px; color: #888; text-transform: uppercase;">Product</th>
              <th style="padding: 10px; text-align: center; font-size: 12px; color: #888; text-transform: uppercase;">Qty</th>
              <th style="padding: 10px; text-align: right; font-size: 12px; color: #888; text-transform: uppercase;">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 14px 0 0; font-weight: 700; font-size: 15px;">Total</td>
              <td style="padding: 14px 0 0; font-weight: 700; font-size: 15px; text-align: right; color: #CA2A31;">₹${Number(total).toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>

        ${address ? `
        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 20px 0;" />
        <h3 style="margin: 0 0 8px; font-size: 14px; color: #000;">Shipping Address</h3>
        <p style="color: #555; font-size: 14px; margin: 0; line-height: 1.6;">${address}</p>
        ` : ''}
      </div>
      <div style="background: #CA2A31; padding: 16px 32px;">
        <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0;">© Kustom Koats — kustomkoats.in | Questions? Email us at ${process.env.SMTP_USER}</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Order Confirmed #${orderId} — Kustom Koats`,
    html,
  });
}
