const {
  escapeHtml,
  getPasswordResetLogoAttachment,
  LOGO_CID,
} = require("./passwordResetEmail");

function buildNewsletterConfirmEmail({ confirmUrl, frontendUrl, unsubscribeUrl }) {
  const safeConfirmUrl = escapeHtml(confirmUrl);
  const siteUrl = escapeHtml((frontendUrl || "https://craftzlk.com").replace(/\/$/, ""));
  const safeUnsubscribeUrl = unsubscribeUrl ? escapeHtml(unsubscribeUrl) : "";
  const logoSrc = `cid:${LOGO_CID}`;
  const year = new Date().getFullYear();

  const subject = "Confirm your CraftzLK subscription";

  const text = [
    "Hi,",
    "",
    "Thanks for joining CraftzLK!",
    "",
    "Please confirm your email address to start receiving our latest products, offers, and maker stories.",
    confirmUrl,
    "",
    "If you didn't request this subscription, you can safely ignore this email.",
    "",
    "Warm regards,",
    "The CraftzLK Team",
    siteUrl,
  ].join("\n");

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
                      Stay in touch
                    </p>
                    <h1 style="margin:0;font-size:28px;line-height:1.25;color:#3d2817;font-weight:700;">
                      Confirm your subscription
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 32px 0 32px;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#3d2817;">
                      Hi,
                    </p>
                    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#5c4033;">
                      Thanks for joining CraftzLK!
                    </p>
                    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#5c4033;">
                      Please confirm your email address to start receiving our latest products, offers, and maker stories.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:28px 32px 8px 32px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="border-radius:999px;background-color:#b8860b;">
                          <a href="${safeConfirmUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">
                            Confirm Subscription
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
                      <a href="${safeConfirmUrl}" style="color:#b8860b;word-break:break-all;">${safeConfirmUrl}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 32px 32px 32px;font-family:Arial,Helvetica,sans-serif;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf8f3;border:1px solid rgba(201,169,97,0.2);border-radius:12px;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <p style="margin:0;font-size:14px;line-height:1.6;color:#5c4033;">
                            If you didn't request this subscription, you can safely ignore this email.
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
              </p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#a8957a;">
                &copy; ${year} CraftzLK. All rights reserved.
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
  buildNewsletterConfirmEmail,
  getPasswordResetLogoAttachment,
};
