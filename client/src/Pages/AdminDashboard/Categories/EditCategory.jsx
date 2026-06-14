import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import ImageUploadField from "../../../Components/AdminDashboard/ImageUploadField";
import { deleteData, editData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function EditCategory() {
  const { id } = useParams();
  const { setAlertBox, fetchCategory } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [formFields, setFormFields] = useState({ name: "", color: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDataFromApi(`/api/category/${id}`).then((res) => {
      const cat = res?.categoryData?.[0];
      if (cat) {
        setFormFields({ name: cat.name || "", color: cat.color || "" });
        setPreviews(cat.images || []);
      }
    });
  }, [id]);

  const changeInput = (e) => {
    setFormFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const save = (e) => {
    e.preventDefault();
    if (!formFields.name.trim() || !formFields.color.trim() || previews.length === 0) {
      setAlertBox?.({ open: true, error: true, msg: "Please fill all fields and keep at least one image." });
      return;
    }
    setIsLoading(true);
    editData(`/api/category/${id}`, {
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
        title="Edit Category"
        breadcrumbs={[{ label: "Category", to: `${ADMIN_BASE}/category` }, { label: "Edit" }]}
      />
      <form onSubmit={save}>
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
              <input className="admin-dash__input" id="color" name="color" value={formFields.color} onChange={changeInput} />
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
              clearStagingOnMount={false}
            />
          </div>
          <button type="submit" className="admin-dash__btn" disabled={isLoading}>
            {isLoading ? "Saving…" : "Update category"}
          </button>
        </section>
      </form>
    </>
  );
}
