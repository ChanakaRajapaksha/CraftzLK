import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import ImageUploadField from "../../../Components/AdminDashboard/ImageUploadField";
import { deleteData, editData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function EditSubCategory() {
  const { id } = useParams();
  const { catData, setAlertBox, fetchCategory } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [formFields, setFormFields] = useState({ name: "", color: "", parentId: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDataFromApi(`/api/category/${id}`).then((res) => {
      const sub = res?.categoryData?.[0];
      if (sub) {
        setFormFields({
          name: sub.name || "",
          color: sub.color || "",
          parentId: sub.parentId || "",
        });
        setPreviews(sub.images || []);
      }
    });
  }, [id]);

  const changeInput = (e) => {
    setFormFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const save = (e) => {
    e.preventDefault();
    if (!formFields.name.trim() || !formFields.color.trim() || !formFields.parentId || previews.length === 0) {
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
      navigate(`${ADMIN_BASE}/subCategory`);
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Edit Sub Category"
        breadcrumbs={[{ label: "Sub Category", to: `${ADMIN_BASE}/subCategory` }, { label: "Edit" }]}
      />
      <form onSubmit={save}>
        <section className="admin-dash__panel">
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="parentId">
                Parent category
              </label>
              <select className="admin-dash__select" id="parentId" name="parentId" value={formFields.parentId} onChange={changeInput}>
                <option value="">Select parent</option>
                {catData?.categoryList?.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="name">
                Sub category name
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
            <label className="admin-dash__label">Images</label>
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
            {isLoading ? "Saving…" : "Update sub category"}
          </button>
        </section>
      </form>
    </>
  );
}
