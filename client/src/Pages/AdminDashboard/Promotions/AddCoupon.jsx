import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { postData } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import CouponForm from "./CouponForm";
import { defaultCouponFields } from "./couponFormDefaults";

export default function AddCoupon() {
  const { setAlertBox } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState({ ...defaultCouponFields });
  const navigate = useNavigate();

  const submit = (_e, payload) => {
    setIsLoading(true);
    postData("/api/coupons/create", payload)
      .then(() => {
        setAlertBox?.({ open: true, error: false, msg: "Coupon created." });
        navigate(`${ADMIN_BASE}/promotions/coupons`);
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to create coupon." });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <AdminPageHeader
        title="Add Coupon"
        breadcrumbs={[
          { label: "Promotions & Marketing", to: `${ADMIN_BASE}/promotions/coupons` },
          { label: "Add Coupon" },
        ]}
      />
      <CouponForm
        formFields={formFields}
        setFormFields={setFormFields}
        setAlertBox={setAlertBox}
        isLoading={isLoading}
        submitLabel="Create coupon"
        onSubmit={submit}
      />
    </>
  );
}
