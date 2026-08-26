import { Navigate, useLocation } from "react-router-dom";
import CmsPageView from "./CmsPageView";
import { CMS_RESERVED_ROOT_PATHS, SYSTEM_CMS_SLUGS } from "../AdminDashboard/Cms/cmsFormDefaults";

export default function CmsDynamicPageRoute() {
  const location = useLocation();
  const slug = location.pathname.replace(/^\/+|\/+$/g, "");

  if (
    !slug ||
    CMS_RESERVED_ROOT_PATHS.has(slug) ||
    SYSTEM_CMS_SLUGS.has(slug)
  ) {
    return <Navigate to="/" replace />;
  }

  return <CmsPageView slug={slug} />;
}
