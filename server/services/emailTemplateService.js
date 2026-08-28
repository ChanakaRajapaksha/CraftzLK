const notificationService = require("./notificationService");
const emailService = require("./emailService");
const { renderTemplateString } = require("../utils/templateRenderer");
const {
  escapeHtml,
  buildOrderEmailShell,
} = require("../templates/orderEmailLayout");
const { getPasswordResetLogoAttachment } = require("../templates/passwordResetEmail");

function textToHtmlBody(text) {
  return String(text || "")
    .split("\n")
    .map((line) => {
      if (!line.trim()) {
        return '<p style="margin:0 0 12px;font-size:0;line-height:0;">&nbsp;</p>';
      }
      return `<p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:#5c4033;">${escapeHtml(line)}</p>`;
    })
    .join("");
}

function buildBrandedHtmlFromText({ subject, body, ctx, eyebrow, heading }) {
  const bodyHtml = textToHtmlBody(body);
  const { html } = buildOrderEmailShell({
    subject,
    eyebrow: eyebrow || "Notification",
    heading: heading || subject,
    bodyHtml,
    ctx: {
      storeName: ctx.storeName || "CraftzLK",
      supportEmail: ctx.supportEmail || "hello@craftzlk.com",
      frontendUrl: ctx.frontendUrl || process.env.FRONTEND_URL || "https://craftzlk.com",
    },
  });
  return html;
}

function renderTemplateRecord(template, variables = {}) {
  return {
    subject: renderTemplateString(template.subject, variables),
    body: renderTemplateString(template.body, variables),
  };
}

async function getActiveTemplate(code, channel = "email") {
  return notificationService.getTemplateByCode(code, channel);
}

async function buildEmailContent({ code, variables, eyebrow, heading }) {
  const template = await getActiveTemplate(code, "email");
  if (!template || template.status !== "active") {
    return null;
  }

  const rendered = renderTemplateRecord(template, variables);
  const html = buildBrandedHtmlFromText({
    subject: rendered.subject,
    body: rendered.body,
    ctx: variables,
    eyebrow,
    heading,
  });
  const logoAttachment = getPasswordResetLogoAttachment();

  return {
    subject: rendered.subject,
    text: rendered.body,
    html,
    attachments: logoAttachment ? [logoAttachment] : [],
  };
}

async function sendTemplatedEmail({ code, to, variables, eyebrow, heading, fallback }) {
  try {
    const content = await buildEmailContent({ code, variables, eyebrow, heading });
    if (content) {
      return emailService.sendEmail({
        to,
        subject: content.subject,
        text: content.text,
        html: content.html,
        attachments: content.attachments,
      });
    }
  } catch (error) {
    console.error(`[emailTemplateService] Failed to send templated email (${code}):`, error.message);
  }

  if (typeof fallback === "function") {
    const fallbackContent = await fallback();
    return emailService.sendEmail({
      to,
      ...fallbackContent,
    });
  }

  return null;
}

module.exports = {
  getActiveTemplate,
  renderTemplateRecord,
  buildEmailContent,
  sendTemplatedEmail,
  buildBrandedHtmlFromText,
};
