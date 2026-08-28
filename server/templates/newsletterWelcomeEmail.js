const {
  escapeHtml,
  getPasswordResetLogoAttachment,
  LOGO_CID,
} = require("./passwordResetEmail");

function buildNewsletterWelcomeEmail({ frontendUrl, unsubscribeUrl }) {
  const siteUrl = escapeHtml((frontendUrl || "https://craftzlk.com").replace(/\/$/, ""));
  const shopUrl = escapeHtml(`${siteUrl}/products`);
  const safeUnsubscribeUrl = escapeHtml(unsubscribeUrl || `${siteUrl}/newsletter/unsubscribe`);
  const logoSrc = `cid:${LOGO_CID}`;
  const year = new Date().getFullYear();

  const subject = "Welcome to CraftzLK";

  const text = [
    "Hi there,",
    "",
    "Thank you for subscribing to CraftzLK!",
    "",
    "You're now part of our community and will be the first to hear about:",
    "- New handcrafted products and collections",
    "- Special offers and exclusive discounts",
    "- Stories from Sri Lankan makers and artisans",
    "- Seasonal collections and featured products",
    "- News and updates from CraftzLK",
    "",
    "We're excited to keep you in touch with the creativity, craftsmanship, and stories of Sri Lanka.",
    "",
    `Discover something special: ${shopUrl}`,
    "",
    "Thank you for supporting local craftsmanship.",
    "",
    "Warm regards,",
    "The CraftzLK Team",
    "",
    "You're receiving this email because you subscribed to CraftzLK updates.",
    `Unsubscribe: ${unsubscribeUrl || `${siteUrl}/newsletter/unsubscribe`}`,
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
                      Welcome
                    </p>
                    <h1 style="margin:0;font-size:28px;line-height:1.25;color:#3d2817;font-weight:700;">
                      Welcome to CraftzLK
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 32px 0 32px;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#3d2817;">
                      Hi there,
                    </p>
                    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#5c4033;">
                      Thank you for subscribing to CraftzLK!
                    </p>
                    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#5c4033;">
                      You're now part of our community and will be the first to hear about:
                    </p>
                    <ul style="margin:0 0 16px 0;padding-left:20px;font-size:16px;line-height:1.7;color:#5c4033;">
                      <li>New handcrafted products and collections</li>
                      <li>Special offers and exclusive discounts</li>
                      <li>Stories from Sri Lankan makers and artisans</li>
                      <li>Seasonal collections and featured products</li>
                      <li>News and updates from CraftzLK</li>
                    </ul>
                    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#5c4033;">
                      We're excited to keep you in touch with the creativity, craftsmanship, and stories of Sri Lanka.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:28px 32px 8px 32px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="border-radius:999px;background-color:#b8860b;">
                          <a href="${shopUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">
                            Discover Something Special
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 32px 32px 32px;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#5c4033;">
                      Thank you for supporting local craftsmanship.
                    </p>
                    <p style="margin:0;font-size:16px;line-height:1.6;color:#3d2817;">
                      Warm regards,<br />
                      <strong>The CraftzLK Team</strong>
                    </p>
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
                You're receiving this email because you subscribed to CraftzLK updates.<br />
                If you no longer wish to receive these emails, you can
                <a href="${safeUnsubscribeUrl}" style="color:#b8860b;text-decoration:underline;">unsubscribe</a>
                at any time.
              </p>
              <p style="margin:12px 0 0;font-size:12px;line-height:1.6;color:#a8957a;">
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
  buildNewsletterWelcomeEmail,
  getPasswordResetLogoAttachment,
};
