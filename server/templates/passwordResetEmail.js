const path = require('path');
const fs = require('fs');

const LOGO_CID = 'craftzlk-logo@craftzlk';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function resolveLogoPath() {
  const candidates = [
    path.join(__dirname, '../../client/public/images/craftzlk.png'),
    path.join(__dirname, '../../client/dist/images/craftzlk.png'),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function getPasswordResetLogoAttachment() {
  const logoPath = resolveLogoPath();
  if (!logoPath) return null;

  return {
    filename: 'craftzlk.png',
    path: logoPath,
    cid: LOGO_CID,
  };
}

function buildPasswordResetEmail({ name, resetUrl, frontendUrl }) {
  const safeName = escapeHtml(name || 'there');
  const safeResetUrl = escapeHtml(resetUrl);
  const siteUrl = escapeHtml((frontendUrl || 'https://craftzlk.com').replace(/\/$/, ''));
  const logoSrc = `cid:${LOGO_CID}`;
  const year = new Date().getFullYear();

  const subject = 'Reset your CraftzLK password';

  const text = [
    `Hello ${name || 'there'},`,
    '',
    'You requested a password reset for your CraftzLK account.',
    'Open the link below to choose a new password:',
    resetUrl,
    '',
    'This link expires in 10 minutes.',
    '',
    "If you didn't request this, you can safely ignore this email.",
    '',
    'Best regards,',
    'The CraftzLK Team',
    siteUrl,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f1e8;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f5f1e8;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="${siteUrl}" style="text-decoration:none;">
                <img src="${logoSrc}" alt="CraftzLK" width="120" style="display:block;border:0;max-width:120px;height:auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(61,40,23,0.08);border:1px solid rgba(201,169,97,0.25);">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="height:6px;background:linear-gradient(90deg,#c9a961 0%,#b8860b 50%,#d4a574 100%);font-size:0;line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:36px 32px 8px 32px;font-family:Georgia,'Times New Roman',serif;">
                    <p style="margin:0 0 8px 0;font-size:13px;line-height:1.4;color:#b8860b;font-family:Arial,Helvetica,sans-serif;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
                      Account security
                    </p>
                    <h1 style="margin:0;font-size:28px;line-height:1.25;color:#3d2817;font-weight:700;">
                      Password reset request
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 32px 0 32px;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#3d2817;">
                      Hello <strong>${safeName}</strong>,
                    </p>
                    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#5c4033;">
                      We received a request to reset the password for your CraftzLK account. Tap the button below to choose a new password and get back to shopping handcrafted treasures from Sri Lanka.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:28px 32px 8px 32px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="border-radius:999px;background-color:#b8860b;">
                          <a href="${safeResetUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">
                            Reset password
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 32px 24px 32px;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0;font-size:13px;line-height:1.6;color:#8b7355;text-align:center;">
                      Button not working? Copy and paste this link into your browser:<br />
                      <a href="${safeResetUrl}" style="color:#b8860b;word-break:break-all;">${safeResetUrl}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 32px 32px 32px;font-family:Arial,Helvetica,sans-serif;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf8f3;border:1px solid rgba(201,169,97,0.2);border-radius:12px;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <p style="margin:0 0 8px 0;font-size:14px;line-height:1.5;color:#3d2817;font-weight:700;">
                            Important
                          </p>
                          <p style="margin:0 0 8px 0;font-size:14px;line-height:1.6;color:#5c4033;">
                            This secure link expires in <strong>10 minutes</strong> for your protection.
                          </p>
                          <p style="margin:0;font-size:14px;line-height:1.6;color:#5c4033;">
                            If you did not request a password reset, please ignore this email. Your password will stay the same.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 16px 8px 16px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 12px 0;font-size:15px;line-height:1.5;color:#3d2817;font-weight:700;">
                Crafted with heart
              </p>
              <p style="margin:0 0 16px 0;font-size:13px;line-height:1.6;color:#8b7355;">
                <a href="${siteUrl}" style="color:#b8860b;text-decoration:none;font-weight:600;">Visit CraftzLK</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="${siteUrl}/signIn" style="color:#b8860b;text-decoration:none;font-weight:600;">Sign in</a>
              </p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#a8957a;">
                &copy; ${year} CraftzLK. All rights reserved.<br />
                Sri Lankan handcrafted goods, delivered with care.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

module.exports = {
  LOGO_CID,
  buildPasswordResetEmail,
  getPasswordResetLogoAttachment,
};
