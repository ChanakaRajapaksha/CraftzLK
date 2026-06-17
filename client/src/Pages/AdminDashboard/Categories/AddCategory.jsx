import { useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { deleteData, postData } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import CategoryForm from "./CategoryForm";
import { defaultCategoryFields, formToPayload } from "./categoryFormDefaults";

export default function AddCategory() {
  const { catData, setAlertBox, fetchCategory } = useOutletContext();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [formFields, setFormFields] = useState({
    ...defaultCategoryFields,
    parentId: searchParams.get("parent") || "",
  });
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    postData("/api/category/create", formToPayload(formFields, previews)).then(() => {
      setIsLoading(false);
      fetchCategory?.();
      deleteData("/api/imageUpload/deleteAllImages");
      setAlertBox?.({ open: true, error: false, msg: "Category published." });
      navigate(`${ADMIN_BASE}/category`);
    }).catch(() => {
      setIsLoading(false);
      setAlertBox?.({ open: true, error: true, msg: "Failed to publish category." });
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Add Category"
        breadcrumbs={[
          { label: "Category", to: `${ADMIN_BASE}/category` },
          { label: "Add" },
        ]}
      />
      <CategoryForm
        formFields={formFields}
        setFormFields={setFormFields}
        previews={previews}
        setPreviews={setPreviews}
        catData={catData}
        setAlertBox={setAlertBox}
        isLoading={isLoading}
        submitLabel="Publish category"
        onSubmit={submit}
      />
    </>
  );
}
