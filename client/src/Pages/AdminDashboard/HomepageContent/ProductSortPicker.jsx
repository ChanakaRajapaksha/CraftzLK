import { useEffect, useMemo, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import ProductController from "../../../controllers/product.controller.js";

export default function ProductSortPicker({
  productIds = [],
  productNames = [],
  onChange,
  searchPlaceholder = "Search products to add…",
}) {
  const [products, setProducts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    ProductController.list()
      .then((res) => {
        const list = res?.products || [];
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch(() => setProducts([]));
  }, []);

  const selectedItems = useMemo(
    () =>
      productIds.map((id, index) => ({
        id,
        name: productNames[index] || products.find((p) => (p._id || p.id) === id)?.name || "Product",
      })),
    [productIds, productNames, products]
  );

  const availableProducts = useMemo(() => {
    let list = products.filter((p) => !productIds.includes(p._id || p.id));
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((p) =>
        [p.name, p.sku, p.catName].some((v) => String(v || "").toLowerCase().includes(q))
      );
    }
    return list;
  }, [products, productIds, searchKeyword]);

  const addProduct = (product) => {
    const id = product._id || product.id;
    if (productIds.includes(id)) return;
    onChange({
      productIds: [...productIds, id],
      productNames: [...productNames, product.name],
    });
  };

  const removeProduct = (id) => {
    const index = productIds.indexOf(id);
    if (index < 0) return;
    onChange({
      productIds: productIds.filter((item) => item !== id),
      productNames: productNames.filter((_, i) => i !== index),
    });
  };

  const moveProduct = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= productIds.length) return;
    const ids = [...productIds];
    const names = [...productNames];
    [ids[index], ids[target]] = [ids[target], ids[index]];
    [names[index], names[target]] = [names[target], names[index]];
    onChange({ productIds: ids, productNames: names });
  };

  return (
    <div className="admin-dash__homepage-picker">
      <div className="admin-dash__homepage-picker-col">
        <label className="admin-dash__label">Select products</label>
        <input
          className="admin-dash__input"
          placeholder={searchPlaceholder}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          aria-label="Search products"
        />
        <div className="admin-dash__checkbox-list admin-dash__homepage-product-list">
          {availableProducts.length === 0 ? (
            <p className="admin-dash__hint">No products available to add.</p>
          ) : (
            availableProducts.slice(0, 80).map((product) => {
              const id = product._id || product.id;
              return (
                <button
                  key={id}
                  type="button"
                  className="admin-dash__homepage-product-option"
                  onClick={() => addProduct(product)}
                >
                  <span>{product.name}</span>
                  <span className="admin-dash__homepage-product-option-meta">
                    {product.catName || "—"}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="admin-dash__homepage-picker-col">
        <label className="admin-dash__label">Sort order</label>
        {selectedItems.length === 0 ? (
          <p className="admin-dash__hint">Selected products will appear here in display order.</p>
        ) : (
          <ol className="admin-dash__homepage-sort-list">
            {selectedItems.map((item, index) => (
              <li key={item.id} className="admin-dash__homepage-sort-item">
                <span className="admin-dash__homepage-sort-rank">{index + 1}</span>
                <div className="admin-dash__homepage-sort-body">
                  <strong>{item.name}</strong>
                </div>
                <div className="admin-dash__actions">
                  <button
                    type="button"
                    className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                    onClick={() => moveProduct(index, -1)}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    type="button"
                    className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                    onClick={() => moveProduct(index, 1)}
                    disabled={index === selectedItems.length - 1}
                    title="Move down"
                  >
                    <FaArrowDown />
                  </button>
                  <button
                    type="button"
                    className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm"
                    onClick={() => removeProduct(item.id)}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
