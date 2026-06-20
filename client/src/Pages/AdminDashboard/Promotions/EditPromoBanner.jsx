import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { deleteData, editData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import PromoBannerForm from "./PromoBannerForm";
import { bannerFromRecord, defaultPromoBannerFields } from "./promoBannerFormDefaults";

export default function EditPromoBanner() {
  const { id } = useParams();
  const { setAlertBox } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState({ ...defaultPromoBannerFields });
  const [desktopPreviews, setDesktopPreviews] = useState([]);
  const [mobilePreviews, setMobilePreviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDataFromApi(`/api/home-slider-banners/${id}`)
      .then((res) => {
        if (res) {
          setFormFields(bannerFromRecord(res));
          if (res.desktopImage) setDesktopPreviews([res.desktopImage]);
          if (res.mobileImage) setMobilePreviews([res.mobileImage]);
        }
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to load banner." });
      });
  }, [id, setAlertBox]);

  const submit = (_e, payload) => {
    setIsLoading(true);
    editData(`/api/home-slider-banners/${id}`, payload)
      .then(() => {
        deleteData("/api/imageUpload/deleteAllImages");
        setAlertBox?.({ open: true, error: false, msg: "Banner updated." });
        navigate(`${ADMIN_BASE}/promotions/banners`);
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to update banner." });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <AdminPageHeader
        title="Edit Banner"
        breadcrumbs={[
          { label: "Promotions & Marketing", to: `${ADMIN_BASE}/promotions/banners` },
          { label: "Edit Banner" },
        ]}
      />
      <PromoBannerForm
        formFields={formFields}
        setFormFields={setFormFields}
        desktopPreviews={desktopPreviews}
        setDesktopPreviews={setDesktopPreviews}
        mobilePreviews={mobilePreviews}
        setMobilePreviews={setMobilePreviews}
        setAlertBox={setAlertBox}
        isLoading={isLoading}
        isEdit
        submitLabel="Update banner"
        onSubmit={submit}
      />
    </>
  );
}
