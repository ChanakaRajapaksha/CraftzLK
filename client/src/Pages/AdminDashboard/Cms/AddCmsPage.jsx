import { Navigate } from "react-router-dom";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function AddCmsPage() {
  return <Navigate to={`${ADMIN_BASE}/cms/pages?action=add`} replace />;
}
