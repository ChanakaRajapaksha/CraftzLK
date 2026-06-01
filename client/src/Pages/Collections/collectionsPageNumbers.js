/** Same windowed page list as Customer Reviews modal pagination */
export function buildPageNumbers(page, totalPages) {
  const pages = [];
  const left = page - 1;
  const right = page + 1;
  let prev = null;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i <= right)) {
      if (prev && i - prev > 1) pages.push("...");
      pages.push(i);
      prev = i;
    }
  }

  return pages;
}
