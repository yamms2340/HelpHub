// server/utils/emailService.js
const Brevo = require('@getbrevo/brevo');

let client = null;

// 🔍 Initialize Brevo client
if (process.env.BREVO_API_KEY) {
  try {
    client = new Brevo.TransactionalEmailsApi();
    client.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );
    console.log('✅ Brevo client initialized');
    console.log('🔑 Key length:', process.env.BREVO_API_KEY.length, 'chars');
  } catch (error) {
    console.error('❌ Brevo client init failed:', error.message);
  }
} else {
  console.warn('⚠️ BREVO_API_KEY not set → Emails disabled');
}

const sendOtpEmail = async (email, otp) => {
  if (!client) {
    console.warn('❌ No Brevo client → Skipping email to:', email);
    return { success: false, message: 'Brevo not configured' };
  }

  const sendSmtpEmail = {
    sender: {
      name: 'HelpHub',
      email: 'yaminireddy2023@gmail.com', // ✅ Your verified sender
    },
    to: [{ email }],
    subject: 'Your HelpHub OTP Code 🔐',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #667eea;">Welcome to HelpHub! 🚀</h2>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; padding: 30px; border-radius: 15px; text-align: center;">
          <h1 style="margin: 0; font-size: 48px; font-weight: bold;">${otp}</h1>
          <p style="margin: 10px 0 0 0;">Your verification code</p>
          <p style="font-size: 14px; opacity: 0.9;">Expires in 10 minutes</p>
        </div>
        <p style="text-align: center; color: #666; margin-top: 20px;">
          Enter this code in HelpHub to verify your email.
        </p>
      </div>
    `,
  };

  try {
    console.log('📧 Sending OTP →', email);
    const result = await client.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Brevo OTP sent:', { 
      to: email, 
      messageId: result.messageId,
      otp: otp 
    });
    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error('❌ Brevo OTP error for', email);
    console.error('   Code:', err.code || 'N/A');
    console.error('   Message:', err.message);
    console.error('   Response:', err.response?.body);
    
    // ✅ Throw error so auth route catches it
    throw new Error(`Brevo failed: ${err.message}`);
  }
};

module.exports = { sendOtpEmail };
