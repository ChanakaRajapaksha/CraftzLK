import { useParams } from "react-router-dom";
import { isSampleProductId } from "../data/sampleProductDetails";
import ProductDetails from "./ProductDetails/index.jsx";
import SampleProductDetails from "./SampleProductDetails/index.jsx";

export default function ProductDetailsRouter() {
  const { id } = useParams();
  if (isSampleProductId(id)) {
    return <SampleProductDetails />;
  }
  return <ProductDetails />;
}
