import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import NewsletterController from "../../controllers/newsletter.controller.js";
import { applyNewsletterApiResult } from "../../utils/newsletterSession.js";
import "./NewsletterAction.css";

export default function NewsletterUnsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [step, setStep] = useState(token ? "confirm" : "error");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, setState] = useState({
    title: token ? "Unsubscribe from CraftzLK" : "Invalid link",
    message: token
      ? "Are you sure you want to stop receiving CraftzLK emails?"
      : "This unsubscribe link is missing or invalid.",
  });

  const handleKeepSubscribed = () => {
    setStep("kept");
    setState({
      title: "You're still subscribed",
      message: "Great! You'll continue receiving CraftzLK updates, offers, and maker stories.",
    });
  };

  const handleConfirmUnsubscribe = async () => {
    if (!token) return;

    setIsSubmitting(true);

    try {
      const result = await NewsletterController.unsubscribe(token);

      if (!result || result.success === false) {
        setStep("error");
        setState({
          title: "Unsubscribe failed",
          message:
            result?.message ||
            "This unsubscribe link is invalid or has already been used.",
        });
        return;
      }

      applyNewsletterApiResult(result, result.subscriber?.email || "");

      setStep("success");
      setState({
        title: "You're Unsubscribed",
        message:
          result.message ||
          "You have successfully unsubscribed from CraftzLK marketing emails. You won't receive further promotional emails from us.",
      });
    } catch (error) {
      setStep("error");
      setState({
        title: "Unsubscribe failed",
        message:
          error?.response?.data?.message ||
          "This unsubscribe link is invalid or has already been used.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="newsletter-action-page">
      <div className="newsletter-action-card">
        {step === "confirm" ? (
          <>
            <p className="newsletter-action-eyebrow">Email preferences</p>
            <h1>{state.title}</h1>
            <p>{state.message}</p>
            <div className="newsletter-action-actions">
              <button
                type="button"
                className="newsletter-action-link newsletter-action-link--danger"
                onClick={handleConfirmUnsubscribe}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={18} sx={{ color: "#fff", mr: 1 }} />
                    Unsubscribing…
                  </>
                ) : (
                  "Yes, Unsubscribe"
                )}
              </button>
              <button
                type="button"
                className="newsletter-action-link newsletter-action-link--secondary"
                onClick={handleKeepSubscribed}
                disabled={isSubmitting}
              >
                Keep Me Subscribed
              </button>
            </div>
          </>
        ) : (
          <>
            <p
              className={`newsletter-action-eyebrow newsletter-action-eyebrow--${
                step === "success" || step === "kept" ? "success" : "error"
              }`}
            >
              {step === "success"
                ? "Unsubscribed"
                : step === "kept"
                  ? "Subscription kept"
                  : "Something went wrong"}
            </p>
            <h1>{state.title}</h1>
            <p>{state.message}</p>
            <Link to="/" className="newsletter-action-link">
              Return to CraftzLK
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
