// services/emailService.js
const Brevo = require('@getbrevo/brevo');

let client = null;

if (process.env.BREVO_API_KEY) {
  client = new Brevo.TransactionalEmailsApi();
  client.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
  );
  console.log('✅ Brevo client initialized');
} else {
  console.warn('⚠️ BREVO_API_KEY not set, emails disabled');
}

// ==================== SEND OTP EMAIL ====================
const sendOtpEmail = async (email, otp) => {
  if (!client) {
    console.warn('❌ No Brevo client - skipping email');
    return;
  }

  const sendSmtpEmail = {
    sender: {
      name: 'HELP-HUB',
      email: 'yaminireddy2023@gmail.com',
    },
    to: [{ email }],
    subject: 'Your HelpHub OTP Code',
    htmlContent: `<h2>Your OTP code</h2><p><b>${otp}</b> (valid for 10 minutes)</p>`,
  };

  try {
    const result = await client.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Brevo OTP sent:', { to: email, messageId: result.messageId });
  } catch (err) {
    console.error('❌ Brevo OTP error:', {
      status: err.response?.status,
      data: err.response?.body || err.response?.data,
    });
  }
};

// ==================== SEND PAYMENT CONFIRMATION EMAIL ====================
const sendPaymentConfirmation = async (recipientEmail, paymentDetails) => {
  if (!client) {
    console.warn('❌ No Brevo client - skipping payment confirmation email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    console.log(`📧 Sending payment confirmation to: ${recipientEmail}`);

    const sendSmtpEmail = {
      sender: {
        name: 'HELP-HUB',
        email: 'yaminireddy2023@gmail.com',
      },
      to: [{ 
        email: recipientEmail,
        name: paymentDetails.donorName || 'Donor'
      }],
      subject: `Payment Successful - ₹${paymentDetails.amount} Donation Received`,
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; }
            .content { padding: 30px; }
            .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-bottom: 20px; font-weight: bold; }
            .receipt-box { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .receipt-box h2 { margin-top: 0; color: #667eea; font-size: 20px; }
            .amount { font-size: 36px; font-weight: bold; color: #667eea; margin: 15px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e5e5; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: 600; color: #666; }
            .detail-value { color: #333; text-align: right; }
            .btn { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .btn:hover { background: #5568d3; }
            .footer { text-align: center; padding: 20px 30px; background: #f9f9f9; color: #666; font-size: 12px; }
            .footer p { margin: 5px 0; }
            @media only screen and (max-width: 600px) {
              .container { margin: 0; border-radius: 0; }
              .content { padding: 20px; }
              .amount { font-size: 28px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Payment Successful!</h1>
              <p>Thank you for your generous donation</p>
            </div>
            
            <div class="content">
              <div class="success-badge">✓ Payment Confirmed</div>
              
              <div class="receipt-box">
                <h2>Payment Receipt</h2>
                
                <div class="amount">₹${paymentDetails.amount}</div>
                
                <div class="detail-row">
                  <span class="detail-label">Transaction ID:</span>
                  <span class="detail-value">${paymentDetails.paymentId}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Order ID:</span>
                  <span class="detail-value">${paymentDetails.orderId}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Date & Time:</span>
                  <span class="detail-value">${new Date().toLocaleString('en-IN', { 
                    dateStyle: 'long', 
                    timeStyle: 'short',
                    timeZone: 'Asia/Kolkata'
                  })}</span>
                </div>
                
                ${paymentDetails.campaignName && paymentDetails.campaignName !== 'General Donation' ? `
                <div class="detail-row">
                  <span class="detail-label">Campaign:</span>
                  <span class="detail-value">${paymentDetails.campaignName}</span>
                </div>
                ` : ''}
                
                ${paymentDetails.method ? `
                <div class="detail-row">
                  <span class="detail-label">Payment Method:</span>
                  <span class="detail-value">${paymentDetails.method.toUpperCase()}</span>
                </div>
                ` : ''}
                
                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value" style="color: #10b981; font-weight: bold;">✓ Completed</span>
                </div>
              </div>
              
              <p style="margin: 20px 0;">Your donation will help make a real difference in our community. We deeply appreciate your support!</p>
              
              <p style="color: #666; font-size: 14px;">This is an auto-generated receipt for your records. You can view all your donations in your HelpHub dashboard.</p>
              
              <center>
                <a href="${process.env.FRONTEND_URL || 'https://helphub-1-1ab2.onrender.com'}/dashboard" class="btn">View Dashboard</a>
              </center>
            </div>
            
            <div class="footer">
              <p style="font-weight: bold; color: #667eea; margin-bottom: 10px;">💚 Thank you for being part of HelpHub!</p>
              <p>If you have any questions, please contact us at yaminireddy2023@gmail.com</p>
              <p style="margin-top: 15px;">
                <small>This email was sent to ${recipientEmail}. This is an automated message, please do not reply directly to this email.</small>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await client.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Payment confirmation email sent successfully:', {
      to: recipientEmail,
      messageId: result.messageId,
      amount: paymentDetails.amount
    });
    
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Failed to send payment confirmation email:', {
      email: recipientEmail,
      error: error.response?.body || error.message
    });
    
    // Don't throw error - email failure shouldn't break payment flow
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOtpEmail,
  sendPaymentConfirmation
};
