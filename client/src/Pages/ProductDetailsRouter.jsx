import SampleProductDetails from "./SampleProductDetails/index.jsx";

/**
 * Storefront product details use the SampleProductDetails layout.
 * Live Mongo IDs are loaded from GET /api/products/:id; sample catalog IDs still work.
 */
export default function ProductDetailsRouter() {
  return <SampleProductDetails />;
}
