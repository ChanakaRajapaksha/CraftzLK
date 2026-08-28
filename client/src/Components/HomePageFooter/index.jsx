import { Link } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MyContext } from "../../App";
import { DEFAULT_STORE_LOGO } from "../../utils/storeBrand";
import { NewsletterController } from "../../controllers/index.js";
import {
  applyNewsletterApiResult,
  clearNewsletterSession,
  getNewsletterSession,
  sessionFromStatusResult,
} from "../../utils/newsletterSession.js";
import "./HomePageFooter.css";

const FOOTER_LINKS = [
  {
    title: "Shop",
    links: [
      { label: "All products", to: "/products" },
      { label: "New arrivals", to: "/products" },
      { label: "Best sellers", to: "/products" },
      { label: "Categories", to: "/products" },
    ],
  },
  {
    title: "Customer care",
    links: [
      { label: "Help center", to: "#" },
      { label: "Shipping & delivery", to: "#" },
      { label: "Returns & refunds", to: "#" },
      { label: "Track your order", to: "/orders" },
    ],
  },
  {
    title: "CraftzLK",
    links: [
      { label: "Our story", to: "#" },
      { label: "Artisans & makers", to: "#" },
      { label: "Sustainability", to: "#" },
      { label: "Contact us", to: "#" },
    ],
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getResendSecondsLeft(resendAvailableAt) {
  if (!resendAvailableAt) return 0;
  const diff = new Date(resendAvailableAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 1000));
}

/** Site footer chrome only — ends at copyright row (no extra content below). */
export default function HomePageFooter() {
  const { storeLogo } = useContext(MyContext);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [session, setSession] = useState(null);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const footerState = isSessionReady ? session?.footerState || "default" : "default";
  const maskedEmail = session?.maskedEmail || "";

  useEffect(() => {
    let cancelled = false;

    async function hydrateFromBackend() {
      const stored = getNewsletterSession();
      const emailToCheck = stored?.email;

      if (!emailToCheck) {
        if (!cancelled) {
          setSession(null);
          setIsSessionReady(true);
        }
        return;
      }

      try {
        const result = await NewsletterController.getStatus(emailToCheck);
        if (cancelled) return;

        if (!result || result.success === false || !result.exists) {
          clearNewsletterSession();
          setSession(null);
          setEmail("");
          setIsSessionReady(true);
          return;
        }

        const next = sessionFromStatusResult(result, emailToCheck, stored);
        setSession(next);
        if (next?.footerState === "unsubscribed") {
          setEmail(next.email);
        }
      } catch {
        if (!cancelled) {
          clearNewsletterSession();
          setSession(null);
        }
      } finally {
        if (!cancelled) setIsSessionReady(true);
      }
    }

    hydrateFromBackend();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session?.resendAvailableAt || session?.canResend) {
      setResendSecondsLeft(0);
      return undefined;
    }

    const tick = () => {
      const seconds = getResendSecondsLeft(session.resendAvailableAt);
      setResendSecondsLeft(seconds);
      if (seconds <= 0) {
        setSession((prev) => (prev ? { ...prev, canResend: true } : prev));
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [session?.resendAvailableAt, session?.canResend]);

  const canShowUnsubscribe = useMemo(
    () => footerState === "subscribed" && Boolean(session?.unsubscribeToken),
    [footerState, session?.unsubscribeToken]
  );

  const syncSessionFromResult = (result, enteredEmail = "") => {
    const next = applyNewsletterApiResult(result, enteredEmail);
    if (next) {
      setSession(next);
      if (next.footerState === "unsubscribed") {
        setEmail(next.email);
      }
      return next;
    }
    return null;
  };

  const refreshStatusForEmail = async (trimmedEmail) => {
    const result = await NewsletterController.getStatus(trimmedEmail);
    if (!result || result.success === false) return null;

    if (!result.exists) {
      if (session?.email === trimmedEmail.toLowerCase()) {
        clearNewsletterSession();
        setSession(null);
      }
      return null;
    }

    const stored = getNewsletterSession();
    const next = sessionFromStatusResult(result, trimmedEmail, stored);
    setSession(next);
    if (next?.footerState === "unsubscribed") {
      setEmail(trimmedEmail.toLowerCase());
    }
    return next;
  };

  const handleSubscribe = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address to subscribe.");
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await NewsletterController.subscribe(trimmedEmail, "Footer");

      if (!result || result.success === false) {
        setErrorMessage(
          result?.message ||
            "We couldn't process your subscription right now. Please try again shortly."
        );
        return;
      }

      syncSessionFromResult(result, trimmedEmail);
      setEmail("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailBlur = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !EMAIL_PATTERN.test(trimmedEmail)) return;

    try {
      await refreshStatusForEmail(trimmedEmail);
    } catch {
      /* ignore status lookup errors */
    }
  };

  const handleResend = async () => {
    const targetEmail = session?.email || email.trim();
    if (!targetEmail) return;

    setErrorMessage("");
    setIsResending(true);

    try {
      const result = await NewsletterController.resendConfirmation(targetEmail);

      if (!result || result.success === false) {
        setErrorMessage(
          result?.message ||
            "We couldn't resend the confirmation email right now. Please try again shortly."
        );
        return;
      }

      syncSessionFromResult(result, targetEmail);
    } finally {
      setIsResending(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!session?.unsubscribeToken) return;

    setErrorMessage("");
    setIsUnsubscribing(true);

    try {
      const result = await NewsletterController.unsubscribe(session.unsubscribeToken);

      if (!result || result.success === false) {
        setErrorMessage(
          result?.message ||
            "We couldn't unsubscribe you right now. Please use the link in your email."
        );
        return;
      }

      const next = syncSessionFromResult(result, session.email);
      if (!next) {
        await refreshStatusForEmail(session.email);
      }
    } finally {
      setIsUnsubscribing(false);
    }
  };

  const renderNewsletterContent = () => {
    if (!isSessionReady) {
      return (
        <p className="home-page-footer__newsletter-state-text">
          Offers, new arrivals, and maker stories — straight to your inbox.
        </p>
      );
    }

    if (footerState === "subscribed") {
      return (
        <div className="home-page-footer__newsletter-state">
          <p className="home-page-footer__newsletter-state-title">✓ You're subscribed!</p>
          <p className="home-page-footer__newsletter-state-text">
            You'll receive our latest offers, new arrivals and maker stories.
          </p>
          {canShowUnsubscribe ? (
            <button
              type="button"
              className="home-page-footer__newsletter-secondary-btn"
              onClick={handleUnsubscribe}
              disabled={isUnsubscribing}
            >
              {isUnsubscribing ? "Unsubscribing…" : "Unsubscribe"}
            </button>
          ) : (
            <p className="home-page-footer__newsletter-hint">
              To manage preferences, use the unsubscribe link in our emails.
            </p>
          )}
        </div>
      );
    }

    if (footerState === "pending") {
      return (
        <div className="home-page-footer__newsletter-state">
          <p className="home-page-footer__newsletter-state-title">Check your inbox!</p>
          <p className="home-page-footer__newsletter-state-text">
            We've sent a confirmation link to{" "}
            <strong>{maskedEmail || session?.email || "your email address"}</strong>.
          </p>
          <button
            type="button"
            className="home-page-footer__newsletter-secondary-btn"
            onClick={handleResend}
            disabled={isResending || resendSecondsLeft > 0}
          >
            {isResending
              ? "Sending…"
              : resendSecondsLeft > 0
                ? `Resend in ${resendSecondsLeft}s`
                : "Resend Confirmation"}
          </button>
        </div>
      );
    }

    if (footerState === "unsubscribed" && session?.email) {
      return (
        <div className="home-page-footer__newsletter-state">
          <p className="home-page-footer__newsletter-state-title">
            You're currently unsubscribed.
          </p>
          <p className="home-page-footer__newsletter-state-text">
            Want to hear from us again?
          </p>
          <form className="home-page-footer__form" onSubmit={handleSubscribe} noValidate>
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email for newsletter"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={handleEmailBlur}
              disabled={isSubmitting}
              autoComplete="email"
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Subscribing…" : "Subscribe Again"}
            </button>
          </form>
        </div>
      );
    }

    return (
      <>
        <p>Offers, new arrivals, and maker stories — straight to your inbox.</p>
        <form className="home-page-footer__form" onSubmit={handleSubscribe} noValidate>
          <input
            type="email"
            placeholder="Your email address"
            aria-label="Email for newsletter"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={handleEmailBlur}
            disabled={isSubmitting}
            autoComplete="email"
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
      </>
    );
  };

  return (
    <footer className="home-page-footer" aria-label="Site footer">
      <div className="home-page-footer__brand-watermark" aria-hidden="true">
        <span className="home-page-footer__brand-watermark-text">CraftzLK</span>
      </div>

      <div className="home-page-footer__chrome">
        <div className="home-page-footer__chrome-inner">
          <div className="home-page-footer__grid">
            <div className="home-page-footer__brand">
              <Link to="/" className="home-page-footer__logo">
                <img src={storeLogo || DEFAULT_STORE_LOGO} alt="CraftzLK" />
              </Link>
              <p className="home-page-footer__tagline">
                Authentic handmade, eco-friendly, and premium homestyle products from
                Sri Lankan artisans.
              </p>
            </div>

            {FOOTER_LINKS.map((col) => (
              <nav key={col.title} className="home-page-footer__col" aria-label={col.title}>
                <h3 className="home-page-footer__col-title">{col.title}</h3>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div className="home-page-footer__newsletter">
              <h3 className="home-page-footer__col-title">Stay in touch</h3>
              {renderNewsletterContent()}

              {errorMessage ? (
                <div
                  className="home-page-footer__newsletter-feedback home-page-footer__newsletter-feedback--error"
                  role="alert"
                >
                  <p className="home-page-footer__newsletter-feedback-text">{errorMessage}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="home-page-footer__bottom">
            <p className="home-page-footer__copy">
              © {new Date().getFullYear()} CraftzLK. All rights reserved.
            </p>
            <ul className="home-page-footer__socials">
              <li>
                <Link to="#" aria-label="Facebook">
                  <FaFacebookF />
                </Link>
              </li>
              <li>
                <Link to="#" aria-label="X (Twitter)">
                  <FaXTwitter />
                </Link>
              </li>
              <li>
                <Link to="#" aria-label="Instagram">
                  <FaInstagram />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
