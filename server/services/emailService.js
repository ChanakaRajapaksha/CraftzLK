const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail({ to, subject, text, html, template, data }) {
    try {
      let emailContent = {};

      if (template) {
        emailContent = this.getEmailTemplate(template, data);
      } else {
        emailContent = { text, html };
      }

      const mailOptions = {
        from: `"CraftzLK" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        ...emailContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  } 

  getEmailTemplate(template, data) {
    const templates = {
      'welcome': {
        subject: 'Welcome to CraftzLK!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to CraftzLK!</h2>
            <p>Hello ${data.name},</p>
            <p>Thank you for registering with us. We're excited to have you on board!</p>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br>The CraftzLK Team</p>
          </div>
        `
      },
      'password-reset': {
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello ${data.name},</p>
            <p>You requested a password reset for your account. Click the link below to reset your password:</p>
            <p><a href="${data.resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
            <p>This link will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>The CraftzLK Team</p>
          </div>
        `
      },
      'password-changed': {
        subject: 'Password Changed Successfully',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Changed Successfully</h2>
            <p>Hello ${data.name},</p>
            <p>Your password has been successfully changed.</p>
            <p>If you didn't make this change, please contact our support team immediately.</p>
            <p>Best regards,<br>The CraftzLK Team</p>
          </div>
        `
      },
      'temporary-password': {
        subject: 'Welcome! Your Temporary Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Welcome to Marketplace!</h2>
              <p>Hello ${data.name},</p>
              <p>Thank you for registering with us. Your account has been successfully created!</p>
              <p style="margin: 20px 0; padding: 15px; background-color: #f0f0f0; border-radius: 5px; font-family: monospace; font-size: 18px; font-weight: bold; text-align: center; color: #007bff;">
                Your Temporary Password: <span style="color: #28a745;">${data.temporaryPassword}</span>
              </p>
              <p style="color: #dc3545; font-weight: bold;">⚠️ Important: This temporary password will expire in 1 day (24 hours).</p>
              <p>Please use this password along with your email address to log in to your account. We recommend changing your password after your first login for security purposes.</p>
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
                If you have any questions, feel free to contact our support team.
              </p>
              <p style="margin-top: 20px;">Best regards,<br><strong>The CraftzLK Team</strong></p>
            </div>
          </div>
        `
      }
    };

    return templates[template] || { text: 'Email template not found' };
  }
}

module.exports = new EmailService();
