import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { postData } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import ShippingMethodForm from "./ShippingMethodForm";
import { defaultShippingMethodFields } from "./shippingFormDefaults";

export default function AddShippingMethod() {
  const { setAlertBox } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState({ ...defaultShippingMethodFields });
  const navigate = useNavigate();

  const submit = (_e, payload) => {
    setIsLoading(true);
    postData("/api/shipping-methods/create", payload)
      .then(() => {
        setAlertBox?.({ open: true, error: false, msg: "Shipping method created." });
        navigate(`${ADMIN_BASE}/shipping/methods`);
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to create shipping method." });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <AdminPageHeader
        title="Add Shipping Method"
        breadcrumbs={[
          { label: "Shipping Management", to: `${ADMIN_BASE}/shipping/methods` },
          { label: "Add" },
        ]}
      />
      <ShippingMethodForm
        formFields={formFields}
        setFormFields={setFormFields}
        setAlertBox={setAlertBox}
        isLoading={isLoading}
        submitLabel="Create method"
        onSubmit={submit}
      />
    </>
  );
}
