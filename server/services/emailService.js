const nodemailer = require("nodemailer");
const { buildPasswordResetEmail, getPasswordResetLogoAttachment } = require("../templates/passwordResetEmail");
const { buildTemporaryPasswordEmail } = require("../templates/temporaryPasswordEmail");
const { buildNewsletterConfirmEmail } = require("../templates/newsletterConfirmEmail");
const { buildNewsletterWelcomeEmail } = require("../templates/newsletterWelcomeEmail");
const { getNotificationEmailConfig } = require("./notificationEmailConfig");

class EmailService {
  async createTransporter() {
    const config = await getNotificationEmailConfig();

    if (!config.smtpUser || !config.smtpPass) {
      throw new Error(
        "Email delivery is not configured. Set notification From email and password, or EMAIL_USER and EMAIL_PASS in the environment."
      );
    }

    return {
      config,
      transporter: nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
      }),
    };
  }

  async sendEmail({ to, subject, text, html, template, data }) {
    try {
      const { transporter, config } = await this.createTransporter();

      if (!config.enabled) {
        console.log("[EmailService] Email notifications are disabled — skipping send.");
        return { skipped: true, reason: "email_disabled" };
      }

      let emailContent = {};

      if (template) {
        emailContent = this.getEmailTemplate(template, data);
      } else {
        emailContent = { text, html };
      }

      const mailOptions = {
        from: `"${config.fromName}" <${config.fromEmail || config.smtpUser}>`,
        to,
        subject: subject || emailContent.subject,
        ...emailContent,
      };

      if (config.replyTo) {
        mailOptions.replyTo = config.replyTo;
      }

      const result = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", result.messageId);
      return result;
    } catch (error) {
      console.error("Email sending failed:", error);
      throw new Error("Failed to send email");
    }
  }

  getEmailTemplate(template, data) {
    const templates = {
      welcome: {
        subject: "Welcome to CraftzLK!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to CraftzLK!</h2>
            <p>Hello ${data.name},</p>
            <p>Thank you for registering with us. We're excited to have you on board!</p>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br>The CraftzLK Team</p>
          </div>
        `,
      },
      "password-reset": (() => {
        const content = buildPasswordResetEmail(data);
        const logoAttachment = getPasswordResetLogoAttachment();
        return {
          subject: content.subject,
          html: content.html,
          text: content.text,
          attachments: logoAttachment ? [logoAttachment] : [],
        };
      })(),
      "password-changed": {
        subject: "Password Changed Successfully",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Changed Successfully</h2>
            <p>Hello ${data.name},</p>
            <p>Your password has been successfully changed.</p>
            <p>If you didn't make this change, please contact our support team immediately.</p>
            <p>Best regards,<br>The CraftzLK Team</p>
          </div>
        `,
      },
      "temporary-password": (() => {
        const content = buildTemporaryPasswordEmail(data);
        const logoAttachment = getPasswordResetLogoAttachment();
        return {
          subject: content.subject,
          html: content.html,
          text: content.text,
          attachments: logoAttachment ? [logoAttachment] : [],
        };
      })(),
      "newsletter-confirm": (() => {
        const content = buildNewsletterConfirmEmail(data);
        const logoAttachment = getPasswordResetLogoAttachment();
        return {
          subject: content.subject,
          html: content.html,
          text: content.text,
          attachments: logoAttachment ? [logoAttachment] : [],
        };
      })(),
      "newsletter-welcome": (() => {
        const content = buildNewsletterWelcomeEmail(data);
        const logoAttachment = getPasswordResetLogoAttachment();
        return {
          subject: content.subject,
          html: content.html,
          text: content.text,
          attachments: logoAttachment ? [logoAttachment] : [],
        };
      })(),
    };

    return templates[template] || { text: "Email template not found" };
  }
}

module.exports = new EmailService();
