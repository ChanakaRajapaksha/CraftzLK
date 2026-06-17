import { formatCurrency } from "../dashboardAnalytics";

export default function TopSellingProductsWidget({ products }) {
  if (!products?.length) {
    return (
      <section className="admin-dash__widget">
        <h2 className="admin-dash__widget-title">Top Selling Products</h2>
        <p className="admin-dash__widget-empty">No sales data in this period</p>
      </section>
    );
  }

  return (
    <section className="admin-dash__widget admin-dash__widget--top-products">
      <div className="admin-dash__widget-head">
        <h2 className="admin-dash__widget-title">Top Selling Products</h2>
      </div>

      <ol className="admin-dash__top-products-list">
        {products.map((product, index) => (
          <li key={product.id} className="admin-dash__top-product-item">
            <span className="admin-dash__top-product-rank">{index + 1}</span>
            <div className="admin-dash__top-product-body">
              <p className="admin-dash__top-product-name">{product.name}</p>
              <div className="admin-dash__top-product-stats">
                <span>Sales: <strong>{product.qty}</strong></span>
                <span>Revenue: <strong>{formatCurrency(product.revenue)}</strong></span>
              </div>
            </div>
            {product.image && (
              <img src={product.image} alt="" className="admin-dash__top-product-img" />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
