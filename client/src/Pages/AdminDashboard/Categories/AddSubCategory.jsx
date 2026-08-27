import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import CategoryController from "../../../controllers/category.controller.js";
import ImageUploadController from "../../../controllers/imageUpload.controller.js";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import CategoryForm from "./CategoryForm";
import { defaultCategoryFields, formToPayload } from "./categoryFormDefaults";

export default function AddSubCategory() {
  const { catData, setAlertBox, fetchCategory } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [formFields, setFormFields] = useState({ ...defaultCategoryFields });
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (!formFields.parentId) {
      setAlertBox?.({ open: true, error: true, msg: "Please select a parent category." });
      return;
    }
    setIsLoading(true);
    CategoryController.create( formToPayload(formFields, previews)).then(() => {
      setIsLoading(false);
      fetchCategory?.();
      ImageUploadController.clearStagingImages();
      setAlertBox?.({ open: true, error: false, msg: "Subcategory published." });
      navigate(`${ADMIN_BASE}/category`);
    }).catch(() => {
      setIsLoading(false);
      setAlertBox?.({ open: true, error: true, msg: "Failed to publish subcategory." });
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Add Subcategory"
        breadcrumbs={[
          { label: "Category", to: `${ADMIN_BASE}/category` },
          { label: "Add Subcategory" },
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
        submitLabel="Publish subcategory"
        onSubmit={submit}
      />
    </>
  );
}
