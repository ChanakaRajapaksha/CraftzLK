import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { editData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import PaymentMethodForm from "./PaymentMethodForm";
import { defaultPaymentMethodFields, getMethodCodeLabel, methodFromRecord } from "./paymentFormDefaults";
import { getPaymentMethodSampleData, isSamplePaymentMethodId } from "./paymentListUtils";

export default function EditPaymentMethod() {
  const { id } = useParams();
  const { setAlertBox } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [methodCode, setMethodCode] = useState("");
  const [formFields, setFormFields] = useState({ ...defaultPaymentMethodFields });
  const navigate = useNavigate();

  useEffect(() => {
    if (isSamplePaymentMethodId(id)) {
      const sample = getPaymentMethodSampleData().find((item) => (item._id || item.id) === id);
      if (sample) {
        setMethodCode(sample.code);
        setFormFields(methodFromRecord(sample));
      }
      return;
    }

    fetchDataFromApi(`/api/payments/methods/${id}`)
      .then((res) => {
        if (res) {
          setMethodCode(res.code || "");
          setFormFields(methodFromRecord(res));
        }
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to load payment method." });
      });
  }, [id, setAlertBox]);

  const submit = (_e, payload) => {
    if (isSamplePaymentMethodId(id)) {
      setAlertBox?.({ open: true, error: false, msg: "Sample method updated locally." });
      navigate(`${ADMIN_BASE}/payments/methods`);
      return;
    }

    setIsLoading(true);
    editData(`/api/payments/methods/${id}`, payload)
      .then(() => {
        setAlertBox?.({ open: true, error: false, msg: "Payment method updated." });
        navigate(`${ADMIN_BASE}/payments/methods`);
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to update payment method." });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <AdminPageHeader
        title={`Edit ${getMethodCodeLabel(methodCode) || "Payment Method"}`}
        subtitle="Update checkout settings and customer instructions."
        breadcrumbs={[
          { label: "Payment Management", to: `${ADMIN_BASE}/payments/methods` },
          { label: "Payment Methods", to: `${ADMIN_BASE}/payments/methods` },
          { label: "Edit" },
        ]}
      />
      <PaymentMethodForm
        methodCode={methodCode}
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
