import { forwardRef, useCallback, useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import Zoom from "@mui/material/Zoom";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import "./AskQuestionModal.css";

const AQM_TRANSITION_MS = { enter: 300, exit: 220 };

const AqmDialogTransition = forwardRef(function AqmDialogTransition(props, ref) {
  return (
    <Zoom
      ref={ref}
      {...props}
      appear
      timeout={AQM_TRANSITION_MS}
      easing={{
        enter: "cubic-bezier(0.16, 1, 0.3, 1)",
        exit: "cubic-bezier(0.4, 0, 1, 1)",
      }}
      style={{ transformOrigin: "center center" }}
    />
  );
});

const getInitialForm = () => ({
  displayName: "",
  email: "",
  question: "",
});

export default function AskQuestionModal({ open, onClose, onSubmit }) {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authUser = useAppSelector((state) => state.auth.user);
  const [form, setForm] = useState(getInitialForm);
  const [errors, setErrors] = useState({});

  const resetForm = useCallback(() => {
    setForm(getInitialForm());
    setErrors({});
  }, []);

  useEffect(() => {
    if (!open) {
      const timer = window.setTimeout(resetForm, AQM_TRANSITION_MS.exit);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [open, resetForm]);

  useEffect(() => {
    if (!open) return;
    if (isAuthenticated && authUser?.userId) return;
    onClose();
    navigate("/signIn", { state: { from: window.location.pathname } });
  }, [open, isAuthenticated, authUser?.userId, onClose, navigate]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const validate = () => {
    const nextErrors = {};
    if (!form.displayName.trim()) nextErrors.displayName = "This field is required";
    if (!form.email.trim()) nextErrors.email = "This field is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address";
    }
    if (!form.question.trim()) nextErrors.question = "This field is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isAuthenticated || !authUser?.userId) {
      onClose();
      navigate("/signIn", { state: { from: window.location.pathname } });
      return;
    }
    if (!validate()) return;
    onSubmit?.({
      displayName: form.displayName.trim(),
      email: form.email.trim(),
      question: form.question.trim(),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="ask-question-modal"
      TransitionComponent={AqmDialogTransition}
      transitionDuration={AQM_TRANSITION_MS}
      maxWidth={false}
      aria-labelledby="aqm-dialog-title"
    >
      <button
        type="button"
        className="close_ aqm-close"
        onClick={onClose}
        aria-label="Close ask question dialog"
      >
        <span aria-hidden="true">×</span>
      </button>

      <form className="aqm-body" onSubmit={handleSubmit} noValidate>
        <h2 id="aqm-dialog-title" className="aqm-title">
          Ask a question
        </h2>

        <div className="aqm-field">
          <label htmlFor="aqm-display-name">Display name</label>
          <input
            id="aqm-display-name"
            type="text"
            value={form.displayName}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, displayName: event.target.value }));
              if (errors.displayName) setErrors((prev) => ({ ...prev, displayName: undefined }));
            }}
            className={errors.displayName ? "aqm-input aqm-input--error" : "aqm-input"}
          />
          {errors.displayName && <p className="aqm-error">{errors.displayName}</p>}
        </div>

        <div className="aqm-field">
          <label htmlFor="aqm-email">Email address</label>
          <input
            id="aqm-email"
            type="email"
            value={form.email}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, email: event.target.value }));
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            className={errors.email ? "aqm-input aqm-input--error" : "aqm-input"}
          />
          {errors.email && <p className="aqm-error">{errors.email}</p>}
        </div>

        <div className="aqm-field">
          <label htmlFor="aqm-question">Question</label>
          <textarea
            id="aqm-question"
            rows={7}
            value={form.question}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, question: event.target.value }));
              if (errors.question) setErrors((prev) => ({ ...prev, question: undefined }));
            }}
            className={errors.question ? "aqm-textarea aqm-input--error" : "aqm-textarea"}
          />
          {errors.question && <p className="aqm-error">{errors.question}</p>}
        </div>

        <div className="aqm-actions">
          <button type="submit" className="aqm-btn aqm-btn--primary">
            Submit Question
          </button>
        </div>
      </form>
    </Dialog>
  );
}
