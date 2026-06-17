import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { deleteData, postData } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import ProductForm, { defaultProductFields } from "./ProductForm";
import { formToPayload } from "./productFormDefaults";

export default function ProductUpload() {
  const { catData, setAlertBox } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [formFields, setFormFields] = useState(defaultProductFields);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    postData("/api/products/create", formToPayload(formFields)).then(() => {
      setIsLoading(false);
      deleteData("/api/imageUpload/deleteAllImages");
      setAlertBox?.({ open: true, error: false, msg: "Product published." });
      navigate(`${ADMIN_BASE}/products`);
    }).catch(() => {
      setIsLoading(false);
      setAlertBox?.({ open: true, error: true, msg: "Failed to publish product." });
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Add Product"
        breadcrumbs={[{ label: "Products", to: `${ADMIN_BASE}/products` }, { label: "Add" }]}
      />
      <ProductForm
        formFields={formFields}
        setFormFields={setFormFields}
        previews={previews}
        setPreviews={setPreviews}
        catData={catData}
        setAlertBox={setAlertBox}
        isLoading={isLoading}
        submitLabel="Publish product"
        onSubmit={submit}
      />
    </>
  );
}
