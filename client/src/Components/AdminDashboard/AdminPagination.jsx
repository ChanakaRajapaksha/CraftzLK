import { buildPageNumbers } from "./adminPageNumbers";

export default function AdminPagination({
  page,
  totalPages,
  totalItems,
  itemLabel = "items",
  rowsPerPage,
  rowsPerPageOptions = [10, 25, 50],
  onPageChange,
  onRowsPerPageChange,
}) {
  const safePage = Math.min(Math.max(0, page), Math.max(0, totalPages - 1));
  const displayPage = safePage + 1;
  const pageItems = buildPageNumbers(displayPage, totalPages);

  const rangeStart = totalItems === 0 ? 0 : safePage * rowsPerPage + 1;
  const rangeEnd = Math.min((safePage + 1) * rowsPerPage, totalItems);

  return (
    <footer className="admin-dash__table-footer">
      <p className="admin-dash__table-footer-info">
        {totalItems === 0 ? (
          <>No {itemLabel} to display</>
        ) : (
          <>
            Showing{" "}
            <strong>
              {rangeStart}–{rangeEnd}
            </strong>{" "}
            of <strong>{totalItems}</strong> {itemLabel}
          </>
        )}
      </p>

      <div className="admin-dash__table-footer-actions">
        {onRowsPerPageChange && (
          <label className="admin-dash__pagination-size">
            <span className="admin-dash__pagination-size-label">Rows per page</span>
            <select
              className="admin-dash__select admin-dash__pagination-size-select"
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
              aria-label="Rows per page"
            >
              {rowsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="admin-dash__pagination-group" role="group" aria-label="Pagination">
          <button
            type="button"
            className="admin-dash__pagination-btn admin-dash__pagination-btn--arrow"
            onClick={() => onPageChange(safePage - 1)}
            disabled={safePage === 0 || totalItems === 0}
            aria-label="Previous page"
          >
            ‹
          </button>

          {totalPages > 1 ? (
            pageItems.map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="admin-dash__pagination-ellipsis">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`admin-dash__pagination-btn${
                    p === displayPage ? " admin-dash__pagination-btn--active" : ""
                  }`}
                  onClick={() => onPageChange(p - 1)}
                  aria-current={p === displayPage ? "page" : undefined}
                  aria-label={`Page ${p}`}
                >
                  {p}
                </button>
              )
            )
          ) : (
            <span className="admin-dash__pagination-btn admin-dash__pagination-btn--active admin-dash__pagination-btn--static">
              1
            </span>
          )}

          <button
            type="button"
            className="admin-dash__pagination-btn admin-dash__pagination-btn--arrow"
            onClick={() => onPageChange(safePage + 1)}
            disabled={safePage >= totalPages - 1 || totalItems === 0}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </footer>
  );
}
