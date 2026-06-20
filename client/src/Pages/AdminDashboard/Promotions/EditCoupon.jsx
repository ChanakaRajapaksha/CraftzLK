import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { editData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import CouponForm from "./CouponForm";
import { couponFromRecord, defaultCouponFields } from "./couponFormDefaults";

export default function EditCoupon() {
  const { id } = useParams();
  const { setAlertBox } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState({ ...defaultCouponFields });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDataFromApi(`/api/coupons/${id}`)
      .then((res) => {
        if (res) setFormFields(couponFromRecord(res));
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to load coupon." });
      });
  }, [id, setAlertBox]);

  const submit = (_e, payload) => {
    setIsLoading(true);
    editData(`/api/coupons/${id}`, payload)
      .then(() => {
        setAlertBox?.({ open: true, error: false, msg: "Coupon updated." });
        navigate(`${ADMIN_BASE}/promotions/coupons`);
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to update coupon." });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <AdminPageHeader
        title="Edit Coupon"
        breadcrumbs={[
          { label: "Promotions & Marketing", to: `${ADMIN_BASE}/promotions/coupons` },
          { label: "Edit Coupon" },
        ]}
      />
      <CouponForm
        formFields={formFields}
        setFormFields={setFormFields}
        setAlertBox={setAlertBox}
        isLoading={isLoading}
        submitLabel="Update coupon"
        onSubmit={submit}
      />
    </>
  );
}
