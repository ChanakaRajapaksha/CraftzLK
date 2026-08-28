const STORAGE_KEY = "craftzlk_newsletter_email";
const LEGACY_STORAGE_KEY = "craftzlk_newsletter_session";

/** UX convenience only — stores the last known email, not subscription status. */
export function getNewsletterSession() {
  try {
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);

    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveNewsletterEmail(email, extras = {}) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) {
    clearNewsletterSession();
    return null;
  }

  const session = {
    email: normalized,
    unsubscribeToken: extras.unsubscribeToken || null,
    updatedAt: new Date().toISOString(),
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function clearNewsletterSession() {
  sessionStorage.removeItem(STORAGE_KEY);
}

/** Build UI session from backend status — database is the source of truth. */
export function sessionFromStatusResult(result, email, previousSession = null) {
  if (!result || result.success === false) {
    return previousSession;
  }

  if (!result.exists) {
    clearNewsletterSession();
    return null;
  }

  const normalizedEmail = String(email || result.subscriber?.email || "")
    .trim()
    .toLowerCase();

  const footerState = result.footerState || result.status || "default";
  if (footerState === "default") {
    return null;
  }

  const session = {
    email: normalizedEmail,
    status: result.status,
    footerState,
    maskedEmail: result.maskedEmail || "",
    unsubscribeToken:
      previousSession?.email === normalizedEmail
        ? previousSession.unsubscribeToken || null
        : null,
    canResend: Boolean(result.canResend),
    resendAvailableAt: result.resendAvailableAt || null,
  };

  saveNewsletterEmail(normalizedEmail, {
    unsubscribeToken: session.unsubscribeToken,
  });

  return session;
}

/** Persist email + optional token after a mutation; UI state comes from API fields. */
export function applyNewsletterApiResult(result, email = "") {
  if (!result || result.success === false) return null;

  const footerState = result.footerState || result.status || "default";
  if (footerState === "default" && !result.status) return null;

  const normalizedEmail =
    String(email || result.subscriber?.email || getNewsletterSession()?.email || "")
      .trim()
      .toLowerCase();

  const existing = getNewsletterSession();
  const unsubscribeToken =
    footerState === "unsubscribed"
      ? null
      : result.unsubscribeToken ||
        (existing?.email === normalizedEmail ? existing.unsubscribeToken : null) ||
        null;

  if (normalizedEmail) {
    saveNewsletterEmail(normalizedEmail, { unsubscribeToken });
  }

  return {
    email: normalizedEmail,
    status: result.status || footerState,
    footerState,
    maskedEmail: result.maskedEmail || "",
    unsubscribeToken,
    canResend: Boolean(result.canResend),
    resendAvailableAt: result.resendAvailableAt || null,
  };
}
