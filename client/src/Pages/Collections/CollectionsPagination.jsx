import { buildPageNumbers } from "./collectionsPageNumbers";

export default function CollectionsPagination({ page, totalPages, onPageChange }) {
  const safePage = Math.min(Math.max(1, page), totalPages);
  const items = buildPageNumbers(safePage, totalPages);

  if (totalPages <= 1) return null;

  return (
    <nav className="collections-pagination" aria-label="Product pages">
      <button
        type="button"
        className="collections-pagination__btn collections-pagination__arrow"
        onClick={() => onPageChange(safePage - 1)}
        disabled={safePage === 1}
        aria-label="Previous page"
      >
        ‹
      </button>

      {items.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="collections-pagination__ellipsis">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`collections-pagination__btn${p === safePage ? " collections-pagination__btn--active" : ""}`}
            onClick={() => onPageChange(p)}
            aria-current={p === safePage ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        className="collections-pagination__btn collections-pagination__arrow"
        onClick={() => onPageChange(safePage + 1)}
        disabled={safePage === totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}
