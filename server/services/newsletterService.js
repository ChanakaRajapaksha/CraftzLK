const crypto = require("crypto");
const {
  NewsletterSubscriber,
  EMAIL_REGEX,
} = require("../models/newsletterSubscriber");
const emailService = require("./emailService");

const CONFIRMATION_TTL_MS = 48 * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function getFrontendBaseUrl() {
  return (process.env.FRONTEND_URL || "http://localhost:3006").replace(/\/$/, "");
}

function maskEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  const [local, domain] = normalized.split("@");
  if (!local || !domain) return normalized;
  const visible = local.slice(0, 1);
  return `${visible}***@${domain}`;
}

function mapFooterState(status, isVerified) {
  if (status === "subscribed" && isVerified) return "subscribed";
  if (status === "pending") return "pending";
  if (status === "unsubscribed") return "unsubscribed";
  return "default";
}

function mapSubscriber(doc, { includeUnsubscribeToken = false } = {}) {
  if (!doc) return null;
  const json = doc.toJSON ? doc.toJSON() : doc;
  const mapped = {
    id: json.id,
    email: json.email,
    status: json.status,
    source: json.source,
    isVerified: json.isVerified,
    subscribedAt: json.subscribedAt,
    confirmedAt: json.confirmedAt,
    unsubscribedAt: json.unsubscribedAt,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
  };
  if (includeUnsubscribeToken && doc.unsubscribeToken) {
    mapped.unsubscribeToken = doc.unsubscribeToken;
  }
  return mapped;
}

function getResendMeta(subscriber) {
  const lastSent = subscriber?.lastConfirmationSentAt
    ? new Date(subscriber.lastConfirmationSentAt)
    : null;
  const resendAvailableAt = lastSent
    ? new Date(lastSent.getTime() + RESEND_COOLDOWN_MS)
    : null;
  const canResend =
    !resendAvailableAt || resendAvailableAt.getTime() <= Date.now();

  return { canResend, resendAvailableAt };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function buildConfirmUrl(token) {
  return `${getFrontendBaseUrl()}/newsletter/confirm?token=${token}`;
}

function buildUnsubscribeUrl(token) {
  return `${getFrontendBaseUrl()}/newsletter/unsubscribe?token=${token}`;
}

function createValidationError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.payload = { success: false, message };
  return error;
}

async function sendConfirmationEmail(subscriber) {
  const confirmUrl = buildConfirmUrl(subscriber.confirmationToken);

  return emailService.sendEmail({
    to: subscriber.email,
    template: "newsletter-confirm",
    data: {
      confirmUrl,
      frontendUrl: getFrontendBaseUrl(),
    },
  });
}

async function sendWelcomeEmail(subscriber) {
  const unsubscribeUrl = buildUnsubscribeUrl(subscriber.unsubscribeToken);

  return emailService.sendEmail({
    to: subscriber.email,
    template: "newsletter-welcome",
    data: {
      frontendUrl: getFrontendBaseUrl(),
      unsubscribeUrl,
    },
  });
}

async function findSubscriberByEmail(email, withSecrets = false) {
  let query = NewsletterSubscriber.findOne({ email });
  if (withSecrets) {
    query = query.select(
      "+confirmationToken +confirmationTokenExpires +confirmedToken +unsubscribeToken"
    );
  }
  return query;
}

class NewsletterService {
  async getStatus(email) {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      throw createValidationError("Email address is required.");
    }

    if (!isValidEmail(normalizedEmail)) {
      throw createValidationError("Please enter a valid email address.");
    }

    const subscriber = await findSubscriberByEmail(normalizedEmail, true);

    if (!subscriber) {
      return {
        success: true,
        exists: false,
        status: null,
        footerState: "default",
        maskedEmail: maskEmail(normalizedEmail),
      };
    }

    const { canResend, resendAvailableAt } = getResendMeta(subscriber);

    return {
      success: true,
      exists: true,
      status: subscriber.status,
      footerState: mapFooterState(subscriber.status, subscriber.isVerified),
      maskedEmail: maskEmail(subscriber.email),
      isVerified: subscriber.isVerified,
      alreadySubscribed:
        subscriber.status === "subscribed" && subscriber.isVerified,
      confirmationPending: subscriber.status === "pending",
      isUnsubscribed: subscriber.status === "unsubscribed",
      canResend: subscriber.status === "pending" && canResend,
      resendAvailableAt: resendAvailableAt?.toISOString() || null,
    };
  }

  async subscribe({ email, source = "Footer" }) {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      throw createValidationError("Email address is required.");
    }

    if (!isValidEmail(normalizedEmail)) {
      throw createValidationError("Please enter a valid email address.");
    }

    let subscriber = await findSubscriberByEmail(normalizedEmail, true);

    if (subscriber?.status === "subscribed" && subscriber.isVerified) {
      return {
        success: true,
        alreadySubscribed: true,
        status: "subscribed",
        footerState: "subscribed",
        maskedEmail: maskEmail(normalizedEmail),
        message: "This email is already subscribed.",
        subscriber: mapSubscriber(subscriber),
      };
    }

    if (subscriber?.status === "pending") {
      const { canResend, resendAvailableAt } = getResendMeta(subscriber);
      return {
        success: true,
        alreadyPending: true,
        status: "pending",
        footerState: "pending",
        maskedEmail: maskEmail(normalizedEmail),
        confirmationPending: true,
        canResend,
        resendAvailableAt: resendAvailableAt?.toISOString() || null,
        message: "We've already sent a confirmation email to this address.",
        subscriber: mapSubscriber(subscriber),
      };
    }

    const confirmationToken = generateToken();
    const unsubscribeToken = generateToken();
    const confirmationTokenExpires = new Date(Date.now() + CONFIRMATION_TTL_MS);
    const now = new Date();

    if (subscriber) {
      subscriber.status = "pending";
      subscriber.source = source || subscriber.source || "Footer";
      subscriber.isVerified = false;
      subscriber.confirmationToken = confirmationToken;
      subscriber.confirmationTokenExpires = confirmationTokenExpires;
      subscriber.unsubscribeToken = subscriber.unsubscribeToken || unsubscribeToken;
      subscriber.subscribedAt = now;
      subscriber.confirmedAt = null;
      subscriber.unsubscribedAt = null;
      subscriber.lastConfirmationSentAt = now;
      await subscriber.save();
    } else {
      subscriber = await NewsletterSubscriber.create({
        email: normalizedEmail,
        status: "pending",
        source,
        isVerified: false,
        confirmationToken,
        confirmationTokenExpires,
        unsubscribeToken,
        subscribedAt: now,
        lastConfirmationSentAt: now,
      });
    }

    try {
      await sendConfirmationEmail(subscriber);
    } catch (error) {
      console.error("[NewsletterService.subscribe] Confirmation email failed:", error);
      throw createValidationError(
        "We couldn't send the confirmation email right now. Please try again shortly.",
        503
      );
    }

    const { canResend, resendAvailableAt } = getResendMeta(subscriber);

    return {
      success: true,
      requiresConfirmation: true,
      status: "pending",
      footerState: "pending",
      maskedEmail: maskEmail(normalizedEmail),
      confirmationPending: true,
      canResend: false,
      resendAvailableAt: resendAvailableAt?.toISOString() || null,
      message:
        "Almost there! We've sent a confirmation email to your inbox. Please confirm your subscription to start receiving our updates.",
      subscriber: mapSubscriber(subscriber),
    };
  }

  async resendConfirmation(email) {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      throw createValidationError("Email address is required.");
    }

    if (!isValidEmail(normalizedEmail)) {
      throw createValidationError("Please enter a valid email address.");
    }

    const subscriber = await findSubscriberByEmail(normalizedEmail, true);

    if (!subscriber) {
      throw createValidationError(
        "No pending subscription found for this email. Please subscribe first."
      );
    }

    if (subscriber.status === "subscribed" && subscriber.isVerified) {
      return {
        success: true,
        alreadySubscribed: true,
        status: "subscribed",
        footerState: "subscribed",
        maskedEmail: maskEmail(normalizedEmail),
        message: "This email is already subscribed.",
      };
    }

    if (subscriber.status !== "pending") {
      throw createValidationError(
        "This email is not awaiting confirmation. Please subscribe again from the footer."
      );
    }

    const { canResend, resendAvailableAt } = getResendMeta(subscriber);

    if (!canResend) {
      const secondsLeft = Math.ceil(
        (resendAvailableAt.getTime() - Date.now()) / 1000
      );
      throw createValidationError(
        `Please wait ${secondsLeft} seconds before requesting another confirmation email.`
      );
    }

    const now = new Date();
    subscriber.confirmationToken = generateToken();
    subscriber.confirmationTokenExpires = new Date(Date.now() + CONFIRMATION_TTL_MS);
    subscriber.lastConfirmationSentAt = now;
    await subscriber.save();

    try {
      await sendConfirmationEmail(subscriber);
    } catch (error) {
      console.error("[NewsletterService.resendConfirmation] Email failed:", error);
      throw createValidationError(
        "We couldn't resend the confirmation email right now. Please try again shortly.",
        503
      );
    }

    const nextResend = new Date(now.getTime() + RESEND_COOLDOWN_MS);

    return {
      success: true,
      status: "pending",
      footerState: "pending",
      maskedEmail: maskEmail(normalizedEmail),
      confirmationPending: true,
      canResend: false,
      resendAvailableAt: nextResend.toISOString(),
      message: "Confirmation email resent. Please check your inbox.",
    };
  }

  async confirmSubscription(token) {
    const normalizedToken = String(token || "").trim();

    if (!normalizedToken) {
      throw createValidationError("Confirmation token is required.");
    }

    const subscriber = await NewsletterSubscriber.findOne({
      confirmationToken: normalizedToken,
      confirmationTokenExpires: { $gt: new Date() },
    }).select("+confirmationToken +confirmationTokenExpires +unsubscribeToken");

    if (!subscriber) {
      const alreadyConfirmed = await NewsletterSubscriber.findOne({
        confirmedToken: normalizedToken,
        status: "subscribed",
        isVerified: true,
      }).select("+unsubscribeToken");

      if (alreadyConfirmed) {
        return {
          success: true,
          alreadyConfirmed: true,
          status: "subscribed",
          footerState: "subscribed",
          maskedEmail: maskEmail(alreadyConfirmed.email),
          unsubscribeToken: alreadyConfirmed.unsubscribeToken,
          message:
            "You're officially subscribed! Thanks for joining the CraftzLK community.",
          subscriber: mapSubscriber(alreadyConfirmed, { includeUnsubscribeToken: true }),
        };
      }

      throw createValidationError(
        "This confirmation link is invalid or has expired. Please subscribe again from the footer."
      );
    }

    const now = new Date();

    await NewsletterSubscriber.findByIdAndUpdate(subscriber._id, {
      $set: {
        status: "subscribed",
        isVerified: true,
        confirmedAt: now,
        subscribedAt: subscriber.subscribedAt || now,
        confirmedToken: normalizedToken,
        unsubscribedAt: null,
      },
      $unset: {
        confirmationToken: 1,
        confirmationTokenExpires: 1,
      },
    });

    subscriber.status = "subscribed";
    subscriber.isVerified = true;

    try {
      await sendWelcomeEmail(subscriber);
    } catch (error) {
      console.error("[NewsletterService.confirmSubscription] Welcome email failed:", error);
    }

    return {
      success: true,
      status: "subscribed",
      footerState: "subscribed",
      maskedEmail: maskEmail(subscriber.email),
      unsubscribeToken: subscriber.unsubscribeToken,
      message:
        "You're officially subscribed! Thanks for joining the CraftzLK community.",
      subscriber: mapSubscriber(subscriber, { includeUnsubscribeToken: true }),
    };
  }

  async unsubscribe(token) {
    const normalizedToken = String(token || "").trim();

    if (!normalizedToken) {
      throw createValidationError("Unsubscribe token is required.");
    }

    const subscriber = await NewsletterSubscriber.findOne({
      unsubscribeToken: normalizedToken,
    }).select("+unsubscribeToken");

    if (!subscriber) {
      throw createValidationError("This unsubscribe link is invalid.");
    }

    if (subscriber.status === "unsubscribed") {
      return {
        success: true,
        alreadyUnsubscribed: true,
        status: "unsubscribed",
        footerState: "unsubscribed",
        maskedEmail: maskEmail(subscriber.email),
        message:
          "You have successfully unsubscribed from CraftzLK marketing emails.",
        subscriber: mapSubscriber(subscriber),
      };
    }

    subscriber.status = "unsubscribed";
    subscriber.isVerified = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    return {
      success: true,
      status: "unsubscribed",
      footerState: "unsubscribed",
      maskedEmail: maskEmail(subscriber.email),
      message:
        "You have successfully unsubscribed from CraftzLK marketing emails. You won't receive further promotional emails from us.",
      subscriber: mapSubscriber(subscriber),
    };
  }

  async listSubscribers() {
    const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 });
    return subscribers.map((doc) => mapSubscriber(doc));
  }

  async getSubscriberStats() {
    const [total, subscribed, pending, unsubscribed] = await Promise.all([
      NewsletterSubscriber.countDocuments(),
      NewsletterSubscriber.countDocuments({ status: "subscribed", isVerified: true }),
      NewsletterSubscriber.countDocuments({ status: "pending" }),
      NewsletterSubscriber.countDocuments({ status: "unsubscribed" }),
    ]);

    return {
      total,
      subscribed,
      pending,
      unsubscribed,
    };
  }
}

module.exports = new NewsletterService();
