import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { deleteData, postData } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import PromoBannerForm from "./PromoBannerForm";
import { defaultPromoBannerFields } from "./promoBannerFormDefaults";

export default function AddPromoBanner() {
  const { setAlertBox } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState({ ...defaultPromoBannerFields });
  const [desktopPreviews, setDesktopPreviews] = useState([]);
  const [mobilePreviews, setMobilePreviews] = useState([]);
  const navigate = useNavigate();

  const submit = (_e, payload) => {
    setIsLoading(true);
    postData("/api/home-slider-banners/create", payload)
      .then(() => {
        deleteData("/api/imageUpload/deleteAllImages");
        setAlertBox?.({ open: true, error: false, msg: "Banner published." });
        navigate(`${ADMIN_BASE}/promotions/banners`);
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to publish banner." });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <AdminPageHeader
        title="Add Banner"
        subtitle="Homepage slider — e.g. New Handmade Collection with Shop Now."
        breadcrumbs={[
          { label: "Promotions & Marketing", to: `${ADMIN_BASE}/promotions/banners` },
          { label: "Add Banner" },
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
        submitLabel="Publish banner"
        onSubmit={submit}
      />
    </>
  );
}
