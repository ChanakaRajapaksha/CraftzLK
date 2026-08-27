import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import ImageUploadField from "../../../Components/AdminDashboard/ImageUploadField";
import { editData, fetchDataFromApi, postData } from "../../../utils/api";
import ImageUploadController from "../../../controllers/imageUpload.controller.js";
import { BANNER_MODULES } from "../adminModules";

export default function BannerFormPage({ moduleKey }) {
  const config = BANNER_MODULES[moduleKey];
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { catData, setAlertBox } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [formFields, setFormFields] = useState({
    catId: "",
    catName: "",
    subCatId: "",
    subCatName: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      fetchDataFromApi(`${config.apiBase}/${id}`).then((res) => {
        if (res) {
          setPreviews(res.images || []);
          setFormFields({
            catId: res.catId || "",
            catName: res.catName || "",
            subCatId: res.subCatId || "",
            subCatName: res.subCatName || "",
          });
          const cat = catData?.categoryList?.find((c) => c._id === res.catId);
          setSubCategories(cat?.children || []);
        }
      });
    }
  }, [id, isEdit, config.apiBase, catData]);

  const onCategoryChange = (e) => {
    const catId = e.target.value;
    const cat = catData?.categoryList?.find((c) => c._id === catId);
    setSubCategories(cat?.children || []);
    setFormFields((prev) => ({
      ...prev,
      catId,
      catName: cat?.name || "",
      subCatId: "",
      subCatName: "",
    }));
  };

  const onSubCategoryChange = (e) => {
    const subCatId = e.target.value;
    const sub = subCategories.find((s) => s._id === subCatId);
    setFormFields((prev) => ({
      ...prev,
      subCatId,
      subCatName: sub?.name || "",
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!isEdit && previews.length === 0) {
      setAlertBox?.({ open: true, error: true, msg: "Upload at least one banner image." });
      return;
    }

    setIsLoading(true);

    try {
      if (isEdit) {
        await editData(`${config.apiBase}/${id}`, {
          ...formFields,
          images: previews,
        });
        setAlertBox?.({ open: true, error: false, msg: "Banner updated." });
      } else {
        await postData(`${config.apiBase}/create`, formFields);
        setAlertBox?.({ open: true, error: false, msg: "Banner published." });
      }
      ImageUploadController.clearStagingImages();
      navigate(config.listPath);
    } catch {
      setAlertBox?.({ open: true, error: true, msg: "Save failed. Upload images first, then publish." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title={isEdit ? "Edit Banner" : "Upload Banner"}
        breadcrumbs={[
          { label: config.title, to: config.listPath },
          { label: isEdit ? "Edit" : "Upload" },
        ]}
      />
      <form onSubmit={submit}>
        <section className="admin-dash__panel">
          {config.hasCategoryFields && (
            <div className="admin-dash__form-grid admin-dash__form-grid--2">
              <div className="admin-dash__field">
                <label className="admin-dash__label" htmlFor="catId">Category</label>
                <select className="admin-dash__select" id="catId" value={formFields.catId} onChange={onCategoryChange}>
                  <option value="">Select category</option>
                  {catData?.categoryList?.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="admin-dash__field">
                <label className="admin-dash__label" htmlFor="subCatId">Sub category</label>
                <select className="admin-dash__select" id="subCatId" value={formFields.subCatId} onChange={onSubCategoryChange}>
                  <option value="">Select sub category</option>
                  {subCategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <div className="admin-dash__field">
            <label className="admin-dash__label">Banner images</label>
            <ImageUploadField
              uploadEndpoint={`${config.apiBase}/upload`}
              deleteImageEndpoint={`${config.apiBase}/deleteImage`}
              previews={previews}
              setPreviews={setPreviews}
              setAlertBox={setAlertBox}
              clearStagingOnMount={!isEdit}
            />
          </div>
          <button type="submit" className="admin-dash__btn" disabled={isLoading}>
            {isLoading ? "Saving…" : isEdit ? "Update banner" : "Publish banner"}
          </button>
        </section>
      </form>
    </>
  );
}
