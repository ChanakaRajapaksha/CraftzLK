import CircularProgress from "@mui/material/CircularProgress";
import "./FixedSizeLoadingButton.css";

/**
 * Button that keeps its size while loading: label stays in layout (hidden),
 * spinner + text shown in an centered overlay.
 */
export default function FixedSizeLoadingButton({
  isLoading = false,
  label,
  loadingLabel = "Adding…",
  className = "",
  leading = null,
  spinnerColor = "currentColor",
  spinnerSize = 14,
  disabled,
  type = "button",
  ...rest
}) {
  return (
    <button
      type={type}
      className={`fixed-loading-btn ${className}`.trim()}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      <span className="fixed-loading-btn__label" aria-hidden={isLoading}>
        {leading}
        {label}
      </span>
      {isLoading && (
        <span className="fixed-loading-btn__loading" aria-hidden>
          <CircularProgress size={spinnerSize} thickness={5} sx={{ color: spinnerColor }} />
          <span>{loadingLabel}</span>
        </span>
      )}
    </button>
  );
}
