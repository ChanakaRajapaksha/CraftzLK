import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { MyContext } from "../../App";

/** Legacy /cart URL — opens the cart drawer and returns to home. */
export default function Cart() {
  const context = useContext(MyContext);

  useEffect(() => {
    context.setEnableFilterTab?.(false);
    context.setCartDrawerOpen?.(true);
    window.scrollTo(0, 0);
  }, [context]);

  return <Navigate to="/" replace />;
}
