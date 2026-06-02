import { useContext } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { MyContext } from "../../App";

export default function HomeRailAddToCartButton({ productId, className = "" }) {
  const context = useContext(MyContext);
  const isLoading = context.addingCartProductId === productId;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    context.addHomeProductToCart?.(productId);
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={isLoading}
      aria-busy={isLoading}
      aria-label={isLoading ? "Adding to cart" : "Add to cart"}
    >
      {isLoading ? (
        <span className="home-rail-atc__loading">
          <CircularProgress size={14} thickness={5} sx={{ color: "#3d2f1f" }} />
          <span>Adding…</span>
        </span>
      ) : (
        "ADD TO CART"
      )}
    </button>
  );
}
