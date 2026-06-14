import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import ImageUploadField from "../../../Components/AdminDashboard/ImageUploadField";
import { deleteData, editData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function ProductEdit() {
  const { id } = useParams();
  const { catData, setAlertBox } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [formFields, setFormFields] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchDataFromApi(`/api/products/${id}`).then((res) => {
      if (res) {
        setFormFields({
          name: res.name || "",
          description: res.description || "",
          brand: res.brand || "",
          price: res.price || "",
          oldPrice: res.oldPrice || "",
          catId: res.catId || "",
          catName: res.catName || "",
          subCatId: res.subCatId || "",
          subCatName: res.subCatName || "",
          category: res.category?._id || res.category || "",
          countInStock: res.countInStock || "",
          rating: res.rating || 4,
          isFeatured: res.isFeatured || false,
          discount: res.discount || "",
          productRam: res.productRam || "",
          size: res.size || "",
          productWeight: res.productWeight || "",
          location: res.location || "All",
        });
        setPreviews(res.images || []);
        const cat = catData?.categoryList?.find((c) => c._id === res.catId);
        setSubCategories(cat?.children || []);
      }
    });
  }, [id, catData]);

  const changeInput = (e) => {
    const { name, value, type, checked } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onCategoryChange = (e) => {
    const catId = e.target.value;
    const cat = catData?.categoryList?.find((c) => c._id === catId);
    setSubCategories(cat?.children || []);
    setFormFields((prev) => ({
      ...prev,
      catId,
      catName: cat?.name || "",
      category: catId,
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
      subCat: sub?.name || "",
    }));
  };

  const save = (e) => {
    e.preventDefault();
    setIsLoading(true);
    editData(`/api/products/${id}`, {
      ...formFields,
      images: previews,
      price: Number(formFields.price),
      oldPrice: Number(formFields.oldPrice || formFields.price),
      countInStock: Number(formFields.countInStock || 0),
      rating: Number(formFields.rating || 4),
      discount: Number(formFields.discount || 0),
    }).then(() => {
      setIsLoading(false);
      deleteData("/api/imageUpload/deleteAllImages");
      setAlertBox?.({ open: true, error: false, msg: "Product updated." });
      navigate(`${ADMIN_BASE}/products`);
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
      <form onSubmit={save}>
        <section className="admin-dash__panel">
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="name">Product name</label>
              <input className="admin-dash__input" id="name" name="name" value={formFields.name || ""} onChange={changeInput} />
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="brand">Brand</label>
              <input className="admin-dash__input" id="brand" name="brand" value={formFields.brand || ""} onChange={changeInput} />
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="price">Price</label>
              <input className="admin-dash__input" id="price" name="price" type="number" value={formFields.price || ""} onChange={changeInput} />
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="oldPrice">Old price</label>
              <input className="admin-dash__input" id="oldPrice" name="oldPrice" type="number" value={formFields.oldPrice || ""} onChange={changeInput} />
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="catId">Category</label>
              <select className="admin-dash__select" id="catId" name="catId" value={formFields.catId || ""} onChange={onCategoryChange}>
                <option value="">Select category</option>
                {catData?.categoryList?.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="subCatId">Sub category</label>
              <select className="admin-dash__select" id="subCatId" name="subCatId" value={formFields.subCatId || ""} onChange={onSubCategoryChange}>
                <option value="">Select sub category</option>
                {subCategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="countInStock">Stock</label>
              <input className="admin-dash__input" id="countInStock" name="countInStock" type="number" value={formFields.countInStock || ""} onChange={changeInput} />
            </div>
          </div>
          <div className="admin-dash__field">
            <label className="admin-dash__label" htmlFor="description">Description</label>
            <textarea className="admin-dash__textarea" id="description" name="description" value={formFields.description || ""} onChange={changeInput} />
          </div>
          <div className="admin-dash__field">
            <label className="admin-dash__label">Product images</label>
            <ImageUploadField
              uploadEndpoint="/api/products/upload"
              deleteImageEndpoint="/api/products/deleteImage"
              previews={previews}
              setPreviews={setPreviews}
              setAlertBox={setAlertBox}
              clearStagingOnMount={false}
            />
          </div>
          <button type="submit" className="admin-dash__btn" disabled={isLoading}>
            {isLoading ? "Saving…" : "Update product"}
          </button>
        </section>
      </form>
    </>
  );
}
