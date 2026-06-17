import { Navigate } from "react-router-dom";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function SubCategoryList() {
  return <Navigate to={`${ADMIN_BASE}/category`} replace />;
}
