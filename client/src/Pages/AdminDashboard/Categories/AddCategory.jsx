import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import ImageUploadField from "../../../Components/AdminDashboard/ImageUploadField";
import { deleteData, postData } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function AddCategory() {
  const { setAlertBox, fetchCategory } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [formFields, setFormFields] = useState({ name: "", color: "" });
  const navigate = useNavigate();

  const changeInput = (e) => {
    setFormFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addCat = (e) => {
    e.preventDefault();
    if (!formFields.name.trim() || !formFields.color.trim() || previews.length === 0) {
      setAlertBox?.({ open: true, error: true, msg: "Please fill all fields and upload at least one image." });
      return;
    }
    setIsLoading(true);
    postData("/api/category/create", {
      ...formFields,
      slug: formFields.name,
      images: [...previews],
    }).then(() => {
      setIsLoading(false);
      fetchCategory?.();
      deleteData("/api/imageUpload/deleteAllImages");
      navigate(`${ADMIN_BASE}/category`);
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Add Category"
        breadcrumbs={[{ label: "Category", to: `${ADMIN_BASE}/category` }, { label: "Add" }]}
      />
      <form onSubmit={addCat}>
        <section className="admin-dash__panel">
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="name">
                Category name
              </label>
              <input className="admin-dash__input" id="name" name="name" value={formFields.name} onChange={changeInput} />
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="color">
                Color
              </label>
              <input className="admin-dash__input" id="color" name="color" value={formFields.color} onChange={changeInput} placeholder="e.g. gold, cream" />
            </div>
          </div>
          <div className="admin-dash__field">
            <label className="admin-dash__label">Category images</label>
            <ImageUploadField
              uploadEndpoint="/api/category/upload"
              deleteImageEndpoint="/api/category/deleteImage"
              previews={previews}
              setPreviews={setPreviews}
              setAlertBox={setAlertBox}
            />
          </div>
          <button type="submit" className="admin-dash__btn" disabled={isLoading}>
            {isLoading ? "Saving…" : "Publish category"}
          </button>
        </section>
      </form>
    </>
  );
}
