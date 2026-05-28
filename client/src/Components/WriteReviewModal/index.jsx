import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import Zoom from "@mui/material/Zoom";
import { AnimatePresence, motion } from "framer-motion";
import { IoArrowBack, IoCloudUploadOutline } from "react-icons/io5";
import "./WriteReviewModal.css";

const WRM_TRANSITION_MS = { enter: 420, exit: 300 };

const WrmDialogTransition = forwardRef(function WrmDialogTransition(props, ref) {
  return (
    <Zoom
      ref={ref}
      {...props}
      appear
      timeout={WRM_TRANSITION_MS}
      easing={{
        enter: "cubic-bezier(0.16, 1, 0.3, 1)",
        exit: "cubic-bezier(0.4, 0, 1, 1)",
      }}
      style={{ transformOrigin: "center center" }}
    />
  );
});

const STEP_ORDER = ["rating", "content", "about", "photo", "success"];

const stepVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -48 : 48,
    opacity: 0,
  }),
};

function StarPicker({ value, hoverValue, onChange, onHover, onLeave, size = "lg", autoAdvance }) {
  const display = hoverValue || value;

  const handleSelect = (star) => {
    onChange(star);
    if (autoAdvance) {
      window.setTimeout(() => autoAdvance(star), 180);
    }
  };

  return (
    <div className={`wrm-stars wrm-stars--${size}`}>
      <div className="wrm-stars__row" role="radiogroup" aria-label="Rate this product">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            className={`wrm-stars__btn${display >= star ? " wrm-stars__btn--filled" : ""}`}
            onClick={() => handleSelect(star)}
            onMouseEnter={() => onHover?.(star)}
            onMouseLeave={() => onLeave?.()}
          >
            <span aria-hidden="true">★</span>
          </button>
        ))}
      </div>
      <div className="wrm-stars__labels">
        <span>Poor</span>
        <span>Great</span>
      </div>
    </div>
  );
}

const initialForm = () => ({
  rating: 0,
  body: "",
  title: "",
  email: "",
  displayName: "",
  anonymous: false,
  photoPreview: "",
  photoName: "",
});

export default function WriteReviewModal({ open, onClose, product }) {
  const [step, setStep] = useState("rating");
  const [direction, setDirection] = useState(1);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const resetModal = useCallback(() => {
    setStep("rating");
    setDirection(1);
    setHoverRating(0);
    setForm(initialForm());
    setErrors({});
  }, []);

  useEffect(() => {
    if (!open) {
      const timer = window.setTimeout(resetModal, WRM_TRANSITION_MS.exit);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [open, resetModal]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape" && step !== "success") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, step]);

  const goToStep = (nextStep, dir = 1) => {
    setDirection(dir);
    setStep(nextStep);
    setErrors({});
  };

  const handleRatingAdvance = (star) => {
    setForm((prev) => ({ ...prev, rating: star }));
    goToStep("content", 1);
  };

  const validateContent = () => {
    if (!form.body.trim()) {
      setErrors({ body: "This field is required" });
      return false;
    }
    return true;
  };

  const validateAbout = () => {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "This field is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address";
    }
    if (!form.displayName.trim()) nextErrors.displayName = "This field is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (step === "content") {
      if (!validateContent()) return;
      goToStep("about", 1);
      return;
    }
    if (step === "about") {
      if (!validateAbout()) return;
      goToStep("photo", 1);
      return;
    }
    if (step === "photo") {
      goToStep("success", 1);
    }
  };

  const handleBack = () => {
    const index = STEP_ORDER.indexOf(step);
    if (index > 0) goToStep(STEP_ORDER[index - 1], -1);
  };

  const handlePhotoFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        photoPreview: String(reader.result ?? ""),
        photoName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    handlePhotoFile(file);
  };

  const showNav = step !== "rating" && step !== "success";
  const showClose = step !== "success";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="write-review-modal"
      TransitionComponent={WrmDialogTransition}
      transitionDuration={WRM_TRANSITION_MS}
      maxWidth={false}
      aria-labelledby="wrm-dialog-title"
    >
      {showClose && (
        <button
          type="button"
          className="close_ wrm-close"
          onClick={onClose}
          aria-label="Close write review dialog"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}

      <div className="wrm-body">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className={`wrm-step wrm-step--${step}`}
          >
            {step === "rating" && (
              <>
                <h2 id="wrm-dialog-title" className="wrm-step__title">
                  How would you rate this product?
                </h2>
                <p className="wrm-step__subtitle">
                  We would love it if you would share a bit about your experience.
                </p>

                <div className="wrm-product">
                  <img
                    src={product?.image}
                    alt=""
                    className="wrm-product__img"
                  />
                  <p className="wrm-product__name">{product?.name}</p>
                </div>

                <StarPicker
                  value={form.rating}
                  hoverValue={hoverRating}
                  onChange={(star) => setForm((prev) => ({ ...prev, rating: star }))}
                  onHover={setHoverRating}
                  onLeave={() => setHoverRating(0)}
                  autoAdvance={handleRatingAdvance}
                />
              </>
            )}

            {step === "content" && (
              <>
                <p className="wrm-step__product-name">{product?.name}</p>

                <div className="wrm-stars-wrap">
                  <StarPicker
                  value={form.rating}
                  hoverValue={hoverRating}
                  onChange={(star) => setForm((prev) => ({ ...prev, rating: star }))}
                  onHover={setHoverRating}
                  onLeave={() => setHoverRating(0)}
                  size="md"
                />
                </div>

                <div className="wrm-field">
                  <label htmlFor="wrm-review-body" className="wrm-field__label">
                    Review content (Required)
                  </label>
                  <textarea
                    id="wrm-review-body"
                    className={`wrm-field__input wrm-field__textarea${errors.body ? " wrm-field__input--error" : ""}`}
                    placeholder="Start writing here..."
                    rows={5}
                    value={form.body}
                    onChange={(event) => {
                      setForm((prev) => ({ ...prev, body: event.target.value }));
                      if (errors.body) setErrors((prev) => ({ ...prev, body: undefined }));
                    }}
                  />
                  {errors.body && <p className="wrm-field__error">{errors.body}</p>}
                </div>

                <div className="wrm-field">
                  <label htmlFor="wrm-review-title" className="wrm-field__label">
                    Review Title
                  </label>
                  <input
                    id="wrm-review-title"
                    type="text"
                    className="wrm-field__input"
                    placeholder="Give your review a title"
                    value={form.title}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                  />
                </div>

                <p className="wrm-legal">
                  We&apos;ll only contact you about your review if necessary. By submitting your
                  review, you agree to our{" "}
                  <a href="/terms" onClick={(event) => event.preventDefault()}>
                    terms and conditions
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" onClick={(event) => event.preventDefault()}>
                    privacy policy
                  </a>
                  .
                </p>
              </>
            )}

            {step === "about" && (
              <>
                <h2 className="wrm-step__title">About you</h2>
                <p className="wrm-step__subtitle">Please tell us more about you.</p>

                <div className="wrm-field">
                  <label htmlFor="wrm-email" className="wrm-field__label">
                    Email address (Required)
                  </label>
                  <input
                    id="wrm-email"
                    type="email"
                    className={`wrm-field__input${errors.email ? " wrm-field__input--error" : ""}`}
                    placeholder="Your email address"
                    value={form.email}
                    onChange={(event) => {
                      setForm((prev) => ({ ...prev, email: event.target.value }));
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                  />
                  {errors.email ? (
                    <p className="wrm-field__error">{errors.email}</p>
                  ) : (
                    <p className="wrm-field__hint">We respect your privacy.</p>
                  )}
                </div>

                <div className="wrm-field">
                  <label htmlFor="wrm-display-name" className="wrm-field__label">
                    Display name (Required)
                  </label>
                  <input
                    id="wrm-display-name"
                    type="text"
                    className={`wrm-field__input${errors.displayName ? " wrm-field__input--error" : ""}`}
                    placeholder="Display name"
                    value={form.displayName}
                    onChange={(event) => {
                      setForm((prev) => ({ ...prev, displayName: event.target.value }));
                      if (errors.displayName) {
                        setErrors((prev) => ({ ...prev, displayName: undefined }));
                      }
                    }}
                  />
                  {errors.displayName && (
                    <p className="wrm-field__error">{errors.displayName}</p>
                  )}
                </div>

                <label className="wrm-checkbox">
                  <input
                    type="checkbox"
                    checked={form.anonymous}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, anonymous: event.target.checked }))
                    }
                  />
                  <span>Post review as anonymous</span>
                </label>
              </>
            )}

            {step === "photo" && (
              <>
                <h2 className="wrm-step__title">Share a picture</h2>
                <p className="wrm-step__subtitle wrm-step__subtitle--narrow">
                  Upload a photo to support your review. *By uploading, you will be eligible for a
                  monthly freebie/voucher giveaway.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="wrm-upload__input"
                  onChange={(event) => handlePhotoFile(event.target.files?.[0])}
                />

                <button
                  type="button"
                  className="wrm-upload"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                >
                  {form.photoPreview ? (
                    <img
                      src={form.photoPreview}
                      alt="Review upload preview"
                      className="wrm-upload__preview"
                    />
                  ) : (
                    <>
                      <IoCloudUploadOutline className="wrm-upload__icon" aria-hidden="true" />
                      <span className="wrm-upload__text">
                        <strong>Click to upload</strong> or drag and drop
                      </span>
                    </>
                  )}
                </button>

                {form.photoName && (
                  <p className="wrm-upload__filename">{form.photoName}</p>
                )}
              </>
            )}

            {step === "success" && (
              <div className="wrm-success">
                <h2 className="wrm-step__title">Thanks for your review!</h2>
                <p className="wrm-success__text">
                  We are processing it and it will appear on the store soon.
                </p>
                <p className="wrm-success__text">
                  Please confirm your email by clicking the link we just sent you. This helps us
                  keep reviews authentic.
                </p>
                <button type="button" className="wrm-btn wrm-btn--primary wrm-btn--close" onClick={onClose}>
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {showNav && (
          <div className="wrm-nav">
            <button type="button" className="wrm-nav__back" onClick={handleBack}>
              <IoArrowBack aria-hidden="true" />
              Back
            </button>
            <button type="button" className="wrm-btn wrm-btn--primary" onClick={handleNext}>
              Next
            </button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
