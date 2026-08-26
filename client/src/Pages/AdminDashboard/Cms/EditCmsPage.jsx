import { Navigate, useParams } from "react-router-dom";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function EditCmsPage() {
  const { id } = useParams();
  return <Navigate to={`${ADMIN_BASE}/cms/pages?edit=${id}`} replace />;
}
