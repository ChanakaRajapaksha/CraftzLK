import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { deleteData, editData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import CmsPageForm from "./CmsPageForm";
import { formToPayload, pageToForm } from "./cmsFormDefaults";
import { getCmsPageSampleData, isSampleCmsPageId } from "./cmsListUtils";

export default function EditCmsPage() {
  const { id } = useParams();
  const { setAlertBox } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [formFields, setFormFields] = useState(pageToForm(null));
  const navigate = useNavigate();

  useEffect(() => {
    if (isSampleCmsPageId(id)) {
      const sample = getCmsPageSampleData().find((item) => (item._id || item.id) === id);
      if (sample) {
        setFormFields(pageToForm(sample));
        setPreviews(sample.images || []);
      }
      return;
    }

    fetchDataFromApi(`/api/cms-pages/${id}`)
      .then((res) => {
        if (res) {
          setFormFields(pageToForm(res));
          setPreviews(res.images || []);
        }
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to load page." });
      });
  }, [id, setAlertBox]);

  const submit = (e) => {
    e.preventDefault();

    if (isSampleCmsPageId(id)) {
      setAlertBox?.({ open: true, error: false, msg: "Sample page updated locally." });
      navigate(`${ADMIN_BASE}/cms/pages`);
      return;
    }

    setIsLoading(true);
    editData(`/api/cms-pages/${id}`, formToPayload(formFields, previews))
      .then(() => {
        deleteData("/api/imageUpload/deleteAllImages");
        setAlertBox?.({ open: true, error: false, msg: "Page updated." });
        navigate(`${ADMIN_BASE}/cms/pages`);
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to update page." });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <AdminPageHeader
        title="Edit Page"
        subtitle="Update title, content, images, and SEO."
        breadcrumbs={[
          { label: "CMS Pages", to: `${ADMIN_BASE}/cms/pages` },
          { label: "Edit" },
        ]}
      />
      <CmsPageForm
        formFields={formFields}
        setFormFields={setFormFields}
        previews={previews}
        setPreviews={setPreviews}
        setAlertBox={setAlertBox}
        isEdit
        isLoading={isLoading}
        submitLabel="Update page"
        onSubmit={submit}
      />
    </>
  );
}
