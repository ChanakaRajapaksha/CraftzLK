import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { editData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import DiscountForm from "./DiscountForm";
import { defaultDiscountFields, discountFromRecord } from "./discountFormDefaults";

export default function EditDiscount() {
  const { id } = useParams();
  const { setAlertBox, catData } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState({ ...defaultDiscountFields });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDataFromApi(`/api/promo-discounts/${id}`)
      .then((res) => {
        if (res) setFormFields(discountFromRecord(res));
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to load discount." });
      });
  }, [id, setAlertBox]);

  const submit = (_e, payload) => {
    setIsLoading(true);
    editData(`/api/promo-discounts/${id}`, payload)
      .then(() => {
        setAlertBox?.({ open: true, error: false, msg: "Discount updated." });
        navigate(`${ADMIN_BASE}/promotions/discounts`);
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to update discount." });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <AdminPageHeader
        title="Edit Discount"
        breadcrumbs={[
          { label: "Promotions & Marketing", to: `${ADMIN_BASE}/promotions/discounts` },
          { label: "Edit" },
        ]}
      />
      <DiscountForm
        formFields={formFields}
        setFormFields={setFormFields}
        catData={catData}
        setAlertBox={setAlertBox}
        isLoading={isLoading}
        submitLabel="Update discount"
        onSubmit={submit}
      />
    </>
  );
}
