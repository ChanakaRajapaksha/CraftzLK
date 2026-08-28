import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import NewsletterController from "../../controllers/newsletter.controller.js";
import { applyNewsletterApiResult } from "../../utils/newsletterSession.js";
import "./NewsletterAction.css";

export default function NewsletterConfirm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, setState] = useState({ status: "loading", title: "", message: "" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!token) {
        if (!cancelled) {
          setState({
            status: "error",
            title: "Invalid link",
            message:
              "This confirmation link is missing or invalid. Please subscribe again from the footer.",
          });
        }
        return;
      }

      try {
        const result = await NewsletterController.confirm(token);
        if (cancelled) return;

        if (!result || result.success === false) {
          setState({
            status: "error",
            title: "Confirmation failed",
            message:
              result?.message ||
              "This confirmation link is invalid or has expired. Please subscribe again from the footer.",
          });
          return;
        }

        applyNewsletterApiResult(result);

        setState({
          status: "success",
          title: "Subscription Confirmed",
          message:
            "You're officially subscribed! Thanks for joining the CraftzLK community. We'll keep you updated with new arrivals, special offers, and stories from Sri Lankan makers.",
        });
      } catch (error) {
        if (cancelled) return;
        setState({
          status: "error",
          title: "Confirmation failed",
          message:
            error?.response?.data?.message ||
            "This confirmation link is invalid or has expired. Please subscribe again from the footer.",
        });
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <section className="newsletter-action-page">
      <div className="newsletter-action-card">
        {state.status === "loading" ? (
          <>
            <CircularProgress size={36} sx={{ color: "#b8860b", mb: 2 }} />
            <h1>Confirming your subscription…</h1>
            <p>Please wait a moment while we verify your email address.</p>
          </>
        ) : (
          <>
            <p className={`newsletter-action-eyebrow newsletter-action-eyebrow--${state.status}`}>
              {state.status === "success" ? "Subscription confirmed" : "Something went wrong"}
            </p>
            <h1>{state.title}</h1>
            <p>{state.message}</p>
            <Link to="/" className="newsletter-action-link">
              Continue Shopping
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
