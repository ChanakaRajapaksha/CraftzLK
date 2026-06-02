/** Empty cart illustration — line cart with “not available” badge (matches drawer empty state). */
export default function EmptyCartIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 88 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 22h52l-4 32H20L12 22z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 22l6-12h14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="26" cy="62" r="4" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="54" cy="62" r="4" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="62" cy="20" r="11" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M57 15l10 10M67 15L57 25"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
