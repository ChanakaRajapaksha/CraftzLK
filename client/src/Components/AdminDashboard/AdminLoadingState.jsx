export default function AdminLoadingState({ message = "Loading…", compact = false }) {
  return (
    <div
      className={`admin-dash__loading${compact ? " admin-dash__loading--compact" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="admin-dash__loading-spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
