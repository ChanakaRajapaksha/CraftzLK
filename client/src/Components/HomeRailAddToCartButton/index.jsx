import { useContext } from "react";
import { MyContext } from "../../App";
import FixedSizeLoadingButton from "../FixedSizeLoadingButton";

export default function HomeRailAddToCartButton({ productId, className = "" }) {
  const context = useContext(MyContext);
  const isLoading = context.addingCartProductId === productId;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    context.addHomeProductToCart?.(productId);
  };

  return (
    <FixedSizeLoadingButton
      className={className}
      isLoading={isLoading}
      label="ADD TO CART"
      onClick={handleClick}
      aria-label={isLoading ? "Adding to cart" : "Add to cart"}
    />
  );
}
