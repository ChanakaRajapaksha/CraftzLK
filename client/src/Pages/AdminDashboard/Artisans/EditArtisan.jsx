import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { deleteData, editData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import ArtisanForm from "./ArtisanForm";
import { artisanToForm, formToPayload } from "./artisanFormDefaults";
import { getArtisanListSampleData, isSampleArtisanId } from "./artisanListUtils";

export default function EditArtisan() {
  const { id } = useParams();
  const { setAlertBox } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [formFields, setFormFields] = useState(artisanToForm(null));
  const navigate = useNavigate();

  useEffect(() => {
    if (isSampleArtisanId(id)) {
      const sample = getArtisanListSampleData().find((item) => (item._id || item.id) === id);
      if (sample) {
        setFormFields(artisanToForm(sample));
        setPreviews(sample.images || []);
      }
      return;
    }

    fetchDataFromApi(`/api/artisans/${id}`).then((res) => {
      const artisan = res?.artisanData?.[0];
      if (artisan) {
        setFormFields(artisanToForm(artisan));
        setPreviews(artisan.images || []);
      }
    });
  }, [id]);

  const save = (e) => {
    e.preventDefault();
    if (isSampleArtisanId(id)) {
      setAlertBox?.({ open: true, error: false, msg: "Sample artisan updated locally for preview." });
      navigate(`${ADMIN_BASE}/artisans`);
      return;
    }

    setIsLoading(true);
    editData(`/api/artisans/${id}`, formToPayload(formFields, previews)).then(() => {
      setIsLoading(false);
      deleteData("/api/imageUpload/deleteAllImages");
      setAlertBox?.({ open: true, error: false, msg: "Artisan updated." });
      navigate(`${ADMIN_BASE}/artisans`);
    }).catch(() => {
      setIsLoading(false);
      setAlertBox?.({ open: true, error: true, msg: "Failed to update artisan." });
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Edit Artisan"
        breadcrumbs={[
          { label: "Brand / Artisan", to: `${ADMIN_BASE}/artisans` },
          { label: "Edit" },
        ]}
      />
      <ArtisanForm
        formFields={formFields}
        setFormFields={setFormFields}
        previews={previews}
        setPreviews={setPreviews}
        setAlertBox={setAlertBox}
        isEdit
        isLoading={isLoading}
        submitLabel="Update artisan"
        onSubmit={save}
      />
    </>
  );
}
