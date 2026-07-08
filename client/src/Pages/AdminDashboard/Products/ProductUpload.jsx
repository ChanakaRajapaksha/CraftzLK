import { Navigate } from "react-router-dom";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function ProductUpload() {
  return <Navigate to={`${ADMIN_BASE}/products?action=add`} replace />;
}
