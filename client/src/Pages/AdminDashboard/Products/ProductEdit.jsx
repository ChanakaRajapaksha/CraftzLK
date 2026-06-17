import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { deleteData, editData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import ProductForm from "./ProductForm";
import { formToPayload, productToForm } from "./productFormDefaults";

export default function ProductEdit() {
  const { id } = useParams();
  const { catData, setAlertBox } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [formFields, setFormFields] = useState(productToForm(null));
  const navigate = useNavigate();

  useEffect(() => {
    fetchDataFromApi(`/api/products/${id}`).then((res) => {
      if (res) {
        setFormFields(productToForm(res));
        setPreviews(res.images || []);
      }
    });
  }, [id]);

  const save = (e) => {
    e.preventDefault();
    setIsLoading(true);
    editData(`/api/products/${id}`, {
      ...formToPayload(formFields),
      images: previews,
    }).then(() => {
      setIsLoading(false);
      deleteData("/api/imageUpload/deleteAllImages");
      setAlertBox?.({ open: true, error: false, msg: "Product updated." });
      navigate(`${ADMIN_BASE}/products`);
    }).catch(() => {
      setIsLoading(false);
      setAlertBox?.({ open: true, error: true, msg: "Failed to update product." });
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Edit Product"
        breadcrumbs={[
          { label: "Products", to: `${ADMIN_BASE}/products` },
          { label: "Edit" },
        ]}
      />
      <ProductForm
        formFields={formFields}
        setFormFields={setFormFields}
        previews={previews}
        setPreviews={setPreviews}
        catData={catData}
        setAlertBox={setAlertBox}
        isEdit
        isLoading={isLoading}
        submitLabel="Update product"
        onSubmit={save}
      />
    </>
  );
}
