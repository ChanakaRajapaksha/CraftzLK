import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { deleteData, postData } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import ArtisanForm from "./ArtisanForm";
import { defaultArtisanFields, formToPayload } from "./artisanFormDefaults";

export default function AddArtisan() {
  const { setAlertBox } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [formFields, setFormFields] = useState({ ...defaultArtisanFields });
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    postData("/api/artisans/create", formToPayload(formFields, previews)).then(() => {
      setIsLoading(false);
      deleteData("/api/imageUpload/deleteAllImages");
      setAlertBox?.({ open: true, error: false, msg: "Artisan published." });
      navigate(`${ADMIN_BASE}/artisans`);
    }).catch(() => {
      setIsLoading(false);
      setAlertBox?.({ open: true, error: true, msg: "Failed to publish artisan." });
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Add Artisan"
        breadcrumbs={[
          { label: "Brand / Artisan", to: `${ADMIN_BASE}/artisans` },
          { label: "Add" },
        ]}
      />
      <ArtisanForm
        formFields={formFields}
        setFormFields={setFormFields}
        previews={previews}
        setPreviews={setPreviews}
        setAlertBox={setAlertBox}
        isLoading={isLoading}
        submitLabel="Publish artisan"
        onSubmit={submit}
      />
    </>
  );
}
