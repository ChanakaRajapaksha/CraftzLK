import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { postData } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import DiscountForm from "./DiscountForm";
import { defaultDiscountFields, DISCOUNT_TYPES } from "./discountFormDefaults";

export default function AddDiscount() {
  const { setAlertBox, catData } = useOutletContext();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState({ ...defaultDiscountFields });
  const navigate = useNavigate();

  useEffect(() => {
    const type = searchParams.get("type");
    if (type && DISCOUNT_TYPES.some((item) => item.value === type)) {
      setFormFields((prev) => ({ ...prev, type }));
    }
  }, [searchParams]);

  const submit = (_e, payload) => {
    setIsLoading(true);
    postData("/api/promo-discounts/create", payload)
      .then(() => {
        setAlertBox?.({ open: true, error: false, msg: "Discount created." });
        navigate(`${ADMIN_BASE}/promotions/discounts`);
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to create discount." });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <AdminPageHeader
        title="Create Discount"
        breadcrumbs={[
          { label: "Promotions & Marketing", to: `${ADMIN_BASE}/promotions/discounts` },
          { label: "Create" },
        ]}
      />
      <DiscountForm
        formFields={formFields}
        setFormFields={setFormFields}
        catData={catData}
        setAlertBox={setAlertBox}
        isLoading={isLoading}
        submitLabel="Create discount"
        onSubmit={submit}
      />
    </>
  );
}
