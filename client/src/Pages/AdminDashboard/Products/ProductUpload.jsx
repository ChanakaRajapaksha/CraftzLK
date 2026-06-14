import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import ImageUploadField from "../../../Components/AdminDashboard/ImageUploadField";
import { deleteData, fetchDataFromApi, postData } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

const defaultFields = {
  name: "",
  description: "",
  brand: "",
  price: "",
  oldPrice: "",
  catId: "",
  catName: "",
  subCatId: "",
  subCatName: "",
  category: "",
  countInStock: "",
  rating: "4",
  isFeatured: false,
  discount: "",
  productRam: "",
  size: "",
  productWeight: "",
  location: "All",
};

export default function ProductUpload() {
  const { catData, setAlertBox } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [formFields, setFormFields] = useState(defaultFields);
  const [subCategories, setSubCategories] = useState([]);
  const [rams, setRams] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [weights, setWeights] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDataFromApi("/api/productRAMS").then((res) => setRams(Array.isArray(res) ? res : []));
    fetchDataFromApi("/api/productSIZE").then((res) => setSizes(Array.isArray(res) ? res : []));
    fetchDataFromApi("/api/productWeight").then((res) => setWeights(Array.isArray(res) ? res : []));
  }, []);

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

  const submit = (e) => {
    e.preventDefault();
    if (!formFields.name.trim() || !formFields.price || !formFields.catId || previews.length === 0) {
      setAlertBox?.({ open: true, error: true, msg: "Name, price, category, and images are required." });
      return;
    }
    setIsLoading(true);
    postData("/api/products/create", {
      ...formFields,
      price: Number(formFields.price),
      oldPrice: Number(formFields.oldPrice || formFields.price),
      countInStock: Number(formFields.countInStock || 0),
      rating: Number(formFields.rating || 4),
      discount: Number(formFields.discount || 0),
    }).then(() => {
      setIsLoading(false);
      deleteData("/api/imageUpload/deleteAllImages");
      setAlertBox?.({ open: true, error: false, msg: "Product published." });
      navigate(`${ADMIN_BASE}/products`);
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Product Upload"
        breadcrumbs={[{ label: "Products", to: `${ADMIN_BASE}/products` }, { label: "Upload" }]}
      />
      <form onSubmit={submit}>
        <section className="admin-dash__panel">
          <div className="admin-dash__form-grid admin-dash__form-grid--2">
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="name">Product name</label>
              <input className="admin-dash__input" id="name" name="name" value={formFields.name} onChange={changeInput} />
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="brand">Brand</label>
              <input className="admin-dash__input" id="brand" name="brand" value={formFields.brand} onChange={changeInput} />
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="price">Price (Rs)</label>
              <input className="admin-dash__input" id="price" name="price" type="number" value={formFields.price} onChange={changeInput} />
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="oldPrice">Old price (Rs)</label>
              <input className="admin-dash__input" id="oldPrice" name="oldPrice" type="number" value={formFields.oldPrice} onChange={changeInput} />
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="catId">Category</label>
              <select className="admin-dash__select" id="catId" name="catId" value={formFields.catId} onChange={onCategoryChange}>
                <option value="">Select category</option>
                {catData?.categoryList?.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="subCatId">Sub category</label>
              <select className="admin-dash__select" id="subCatId" name="subCatId" value={formFields.subCatId} onChange={onSubCategoryChange}>
                <option value="">Select sub category</option>
                {subCategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="countInStock">Stock count</label>
              <input className="admin-dash__input" id="countInStock" name="countInStock" type="number" value={formFields.countInStock} onChange={changeInput} />
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="discount">Discount (%)</label>
              <input className="admin-dash__input" id="discount" name="discount" type="number" value={formFields.discount} onChange={changeInput} />
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="productRam">RAM</label>
              <select className="admin-dash__select" id="productRam" name="productRam" value={formFields.productRam} onChange={changeInput}>
                <option value="">Select RAM</option>
                {rams.map((r) => (
                  <option key={r._id} value={r.productRam}>{r.productRam}</option>
                ))}
              </select>
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="size">Size</label>
              <select className="admin-dash__select" id="size" name="size" value={formFields.size} onChange={changeInput}>
                <option value="">Select size</option>
                {sizes.map((s) => (
                  <option key={s._id} value={s.size}>{s.size}</option>
                ))}
              </select>
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="productWeight">Weight</label>
              <select className="admin-dash__select" id="productWeight" name="productWeight" value={formFields.productWeight} onChange={changeInput}>
                <option value="">Select weight</option>
                {weights.map((w) => (
                  <option key={w._id} value={w.productWeight}>{w.productWeight}</option>
                ))}
              </select>
            </div>
            <div className="admin-dash__field">
              <label className="admin-dash__label" htmlFor="location">Location</label>
              <input className="admin-dash__input" id="location" name="location" value={formFields.location} onChange={changeInput} />
            </div>
          </div>
          <div className="admin-dash__field">
            <label className="admin-dash__label" htmlFor="description">Description</label>
            <textarea className="admin-dash__textarea" id="description" name="description" value={formFields.description} onChange={changeInput} />
          </div>
          <div className="admin-dash__field">
            <label className="admin-dash__label">
              <input type="checkbox" name="isFeatured" checked={formFields.isFeatured} onChange={changeInput} style={{ marginRight: "0.5rem" }} />
              Featured product
            </label>
          </div>
          <div className="admin-dash__field">
            <label className="admin-dash__label">Product images</label>
            <ImageUploadField
              uploadEndpoint="/api/products/upload"
              deleteImageEndpoint="/api/products/deleteImage"
              previews={previews}
              setPreviews={setPreviews}
              setAlertBox={setAlertBox}
            />
          </div>
          <button type="submit" className="admin-dash__btn" disabled={isLoading}>
            {isLoading ? "Publishing…" : "Publish product"}
          </button>
        </section>
      </form>
    </>
  );
}
