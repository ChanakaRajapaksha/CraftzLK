import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import CategoryController from "../../../controllers/category.controller.js";
import ImageUploadController from "../../../controllers/imageUpload.controller.js";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import CategoryForm from "./CategoryForm";
import { categoryToForm, formToPayload } from "./categoryFormDefaults";

export default function EditSubCategory() {
  const { id } = useParams();
  const { catData, setAlertBox, fetchCategory } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [formFields, setFormFields] = useState(categoryToForm(null));
  const navigate = useNavigate();

  useEffect(() => {
    CategoryController.getById(id).then((res) => {
      const cat = res?.categoryData?.[0];
      if (cat) {
        setFormFields(categoryToForm(cat));
        setPreviews(cat.images || []);
      }
    });
  }, [id]);

  const save = (e) => {
    e.preventDefault();
    setIsLoading(true);
    CategoryController.update(id, formToPayload(formFields, previews)).then(() => {
      setIsLoading(false);
      fetchCategory?.();
      ImageUploadController.clearStagingImages();
      setAlertBox?.({ open: true, error: false, msg: "Subcategory updated." });
      navigate(`${ADMIN_BASE}/category`);
    }).catch(() => {
      setIsLoading(false);
      setAlertBox?.({ open: true, error: true, msg: "Failed to update subcategory." });
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Edit Subcategory"
        breadcrumbs={[
          { label: "Category", to: `${ADMIN_BASE}/category` },
          { label: "Edit" },
        ]}
      />
      <CategoryForm
        formFields={formFields}
        setFormFields={setFormFields}
        previews={previews}
        setPreviews={setPreviews}
        catData={catData}
        setAlertBox={setAlertBox}
        isEdit
        isLoading={isLoading}
        submitLabel="Update subcategory"
        onSubmit={save}
      />
    </>
  );
}
