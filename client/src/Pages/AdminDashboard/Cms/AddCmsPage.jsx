import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { deleteData, postData } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import CmsPageForm from "./CmsPageForm";
import { defaultCmsPageFields, formToPayload } from "./cmsFormDefaults";

export default function AddCmsPage() {
  const { setAlertBox } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [formFields, setFormFields] = useState({ ...defaultCmsPageFields });
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    postData("/api/cms-pages/create", formToPayload(formFields, previews))
      .then(() => {
        deleteData("/api/imageUpload/deleteAllImages");
        setAlertBox?.({ open: true, error: false, msg: "Page published." });
        navigate(`${ADMIN_BASE}/cms/pages`);
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to publish page." });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <AdminPageHeader
        title="Add Page"
        subtitle="Create a new static CMS page."
        breadcrumbs={[
          { label: "CMS Pages", to: `${ADMIN_BASE}/cms/pages` },
          { label: "Add" },
        ]}
      />
      <CmsPageForm
        formFields={formFields}
        setFormFields={setFormFields}
        previews={previews}
        setPreviews={setPreviews}
        setAlertBox={setAlertBox}
        isLoading={isLoading}
        submitLabel="Publish page"
        onSubmit={submit}
      />
    </>
  );
}
