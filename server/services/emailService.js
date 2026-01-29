const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change to other services like 'outlook', 'yahoo', etc.
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
});

/**
 * Send welcome email to new user
 * @param {Object} user - User object containing email, name, registrationId
 */
const sendWelcomeEmail = async (user) => {
    try {
        if (!user.email) {
            console.log('No email provided, skipping email notification');
            return;
        }

        const mailOptions = {
            from: `"Smart Hood Community" <${process.env.EMAIL_USER || 'noreply@smarthood.com'}>`,
            to: user.email,
            subject: '🎉 Welcome to Smart Hood Community!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #667eea; text-align: center; margin-bottom: 20px;">🎊 Welcome to Smart Hood!</h1>
            
            <p style="font-size: 16px; color: #334155; line-height: 1.6;">
              Hello <strong>${user.name}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #334155; line-height: 1.6;">
              We're thrilled to have you join the Smart Hood community! Your account has been successfully created.
            </p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #667eea; margin-top: 0;">Your Account Details:</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${user.name}</p>
              <p style="margin: 5px 0;"><strong>Username:</strong> ${user.username}</p>
              <p style="margin: 5px 0;"><strong>Unique ID:</strong> <span style="color: #f59e0b; font-weight: bold; font-size: 18px;">${user.registrationId}</span></p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${user.phone}</p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;">
                <strong>⭐ Important:</strong> Your Unique ID (${user.registrationId}) is used for service completion verification. Keep it safe!
              </p>
            </div>
            
            <h3 style="color: #334155; margin-top: 30px;">What You Can Do:</h3>
            <ul style="color: #64748b; line-height: 1.8;">
              <li>🛠️ Post and browse service requests</li>
              <li>🏛️ Discover local tourism spots</li>
              <li>🚨 Access emergency services</li>
              <li>📅 Join community events</li>
              <li>💰 Track your revenue (Generated/Spent)</li>
              <li>⭐ Rate and review community members</li>
            </ul>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:5173/login" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Get Started Now
              </a>
            </div>
            
            <p style="font-size: 14px; color: #94a3b8; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              Need help? Contact us at support@smarthood.com<br>
              © 2026 Smart Hood Community. All rights reserved.
            </p>
          </div>
        </div>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending welcome email:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendWelcomeEmail };
