import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { deleteData, editData, fetchDataFromApi, postData } from "../../../utils/api";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import CategoryForm from "./CategoryForm";
import { categoryToForm, defaultCategoryFields, formToPayload } from "./categoryFormDefaults";

export default function CategoryFormModal({
  open,
  categoryId = null,
  initialParentId = "",
  onClose,
  onSaved,
  setAlertBox,
  catData,
  fetchCategory,
}) {
  const isEdit = Boolean(categoryId);
  const [formFields, setFormFields] = useState({ ...defaultCategoryFields });
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    if (!isEdit) {
      setFormFields({
        ...defaultCategoryFields,
        parentId: initialParentId || "",
      });
      setPreviews([]);
      setLoading(false);
    } else {
      setLoading(true);
      fetchDataFromApi(`/api/category/${categoryId}`)
        .then((res) => {
          const cat = res?.category || res?.categoryData?.[0];
          if (cat) {
            setFormFields(categoryToForm(cat));
            setPreviews(cat.images || []);
          } else {
            setAlertBox?.({ open: true, error: true, msg: "Category not found." });
            onClose?.();
          }
        })
        .catch(() => {
          setAlertBox?.({ open: true, error: true, msg: "Failed to load category." });
          onClose?.();
        })
        .finally(() => setLoading(false));
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, isEdit, categoryId, initialParentId, onClose, setAlertBox]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = formToPayload(formFields, previews);
    const request = isEdit
      ? editData(`/api/category/${categoryId}`, payload)
      : postData("/api/category/create", payload);

    request
      .then((res) => {
        if (!res || res.success === false) {
          setAlertBox?.({
            open: true,
            error: true,
            msg:
              res?.message ||
              (isEdit ? "Failed to update category." : "Failed to publish category."),
          });
          return;
        }

        fetchCategory?.();
        deleteData("/api/imageUpload/deleteAllImages").catch(() => {});
        setAlertBox?.({
          open: true,
          error: false,
          msg: isEdit ? "Category updated." : "Category published.",
        });
        onSaved?.();
        onClose?.();
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message ||
          (isEdit ? "Failed to update category." : "Failed to publish category.");
        setAlertBox?.({ open: true, error: true, msg: message });
      })
      .finally(() => setSaving(false));
  };

  if (!open) return null;

  return (
    <div
      className="admin-dash__settings-modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="admin-dash__settings-modal admin-dash__settings-modal--categories"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-form-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-dash__settings-modal-accent" aria-hidden="true" />

        <div className="admin-dash__settings-modal-head">
          <div className="admin-dash__settings-modal-head-main">
            <p className="admin-dash__settings-modal-eyebrow">Category Management</p>
            <h2 id="category-form-modal-title" className="admin-dash__settings-modal-title">
              {isEdit ? "Edit category" : "Add category"}
            </h2>
            <p className="admin-dash__settings-modal-sub">
              {isEdit
                ? "Update category details, image, description, and SEO settings."
                : "Create a main category or subcategory for your product catalog."}
            </p>
          </div>
          <button
            type="button"
            className="admin-dash__settings-modal-close"
            onClick={onClose}
            aria-label="Close category form"
          >
            <IoClose />
          </button>
        </div>

        <div className="admin-dash__settings-modal-body">
          {loading ? (
            <AdminLoadingState message="Loading category…" compact />
          ) : (
            <CategoryForm
              formFields={formFields}
              setFormFields={setFormFields}
              previews={previews}
              setPreviews={setPreviews}
              catData={catData}
              setAlertBox={setAlertBox}
              isEdit={isEdit}
              isLoading={saving}
              variant="modal"
              onSubmit={handleSubmit}
            />
          )}
        </div>

        {!loading && (
          <div className="admin-dash__settings-modal-foot">
            <button
              type="button"
              className="admin-dash__btn admin-dash__btn--ghost"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="category-form-modal"
              className="admin-dash__btn"
              disabled={saving}
            >
              {saving ? "Saving…" : isEdit ? "Update category" : "Publish category"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
