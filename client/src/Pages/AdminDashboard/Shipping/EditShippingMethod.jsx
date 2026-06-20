import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { editData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import ShippingMethodForm from "./ShippingMethodForm";
import { defaultShippingMethodFields, methodFromRecord } from "./shippingFormDefaults";

export default function EditShippingMethod() {
  const { id } = useParams();
  const { setAlertBox } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState({ ...defaultShippingMethodFields });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDataFromApi(`/api/shipping-methods/${id}`)
      .then((res) => {
        if (res) setFormFields(methodFromRecord(res));
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to load shipping method." });
      });
  }, [id, setAlertBox]);

  const submit = (_e, payload) => {
    setIsLoading(true);
    editData(`/api/shipping-methods/${id}`, payload)
      .then(() => {
        setAlertBox?.({ open: true, error: false, msg: "Shipping method updated." });
        navigate(`${ADMIN_BASE}/shipping/methods`);
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to update shipping method." });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <AdminPageHeader
        title="Edit Shipping Method"
        breadcrumbs={[
          { label: "Shipping Management", to: `${ADMIN_BASE}/shipping/methods` },
          { label: "Edit" },
        ]}
      />
      <ShippingMethodForm
        formFields={formFields}
        setFormFields={setFormFields}
        setAlertBox={setAlertBox}
        isLoading={isLoading}
        submitLabel="Update method"
        onSubmit={submit}
      />
    </>
  );
}
