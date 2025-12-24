// server/utils/emailService.js
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

const sendOtpEmail = async (email, otp) => {
  if (!client) {
    console.warn('❌ No Brevo client - skipping email');
    return;
  }

  const sendSmtpEmail = {
    sender: {
      name: 'nil',
      email: 'yaminireddy2023@gmail.com', // your verified sender
    },
    to: [{ email }],
    subject: 'Your HelpHub OTP Code',
    htmlContent: `<h2>Your OTP code</h2><p><b>${otp}</b> (valid for 10 minutes)</p>`,
  };

  try {
    const result = await client.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Brevo OTP sent:', { to: email, messageId: result.messageId });
  } catch (err) {
    console.error('❌ Brevo OTP error:', err.response?.body || err.message);
  }
};

module.exports = { sendOtpEmail };
