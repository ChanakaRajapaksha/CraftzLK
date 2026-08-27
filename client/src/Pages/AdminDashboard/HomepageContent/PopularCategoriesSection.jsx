import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FaArrowDown, FaArrowUp, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import ImageUploadField from "../../../Components/AdminDashboard/ImageUploadField";
import { homepageEndpoints } from "../../../api/endpoint.js";
import HomepageSectionShell, { Field } from "./HomepageSectionShell";
import { useHomepageSection } from "./useHomepageSection";

function emptyItem(order = 1) {
  return {
    categoryId: "",
    categoryName: "",
    image: "",
    displayOrder: order,
  };
}

export default function PopularCategoriesSection() {
  const { setAlertBox, catData } = useOutletContext();
  const { formFields, setFormFields, isLoading, usingSampleData, saveSection } =
    useHomepageSection("popularCategories");
  const [imagePreviews, setImagePreviews] = useState({});

  const items = formFields.items || [];

  const categories = useMemo(
    () => catData?.categoryList || [],
    [catData]
  );

  const submit = (e) => {
    e.preventDefault();
    const normalized = items
      .filter((item) => item.categoryId)
      .map((item, index) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        image: item.image || imagePreviews[item.categoryId]?.[0] || "",
        displayOrder: Number(item.displayOrder) || index + 1,
      }));

    saveSection({
      enabled: formFields.enabled,
      items: normalized,
    });
  };

  const addItem = () => {
    setFormFields((prev) => ({
      ...prev,
      items: [...(prev.items || []), emptyItem((prev.items?.length || 0) + 1)],
    }));
  };

  const updateItem = (index, patch) => {
    setFormFields((prev) => {
      const next = [...(prev.items || [])];
      next[index] = { ...next[index], ...patch };
      return { ...prev, items: next };
    });
  };

  const removeItem = (index) => {
    setFormFields((prev) => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index),
    }));
  };

  const moveItem = (index, direction) => {
    setFormFields((prev) => {
      const next = [...(prev.items || [])];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return {
        ...prev,
        items: next.map((item, i) => ({ ...item, displayOrder: i + 1 })),
      };
    });
  };

  const onCategoryChange = (index, categoryId) => {
    const cat = categories.find((c) => (c._id || c.id) === categoryId);
    updateItem(index, {
      categoryId,
      categoryName: cat?.name || "",
      image: cat?.images?.[0] || items[index]?.image || "",
    });
  };

  return (
    <HomepageSectionShell
      title="Popular Categories"
      subtitle="Curate category tiles with images and display order for the homepage grid."
      sectionLabel="Popular Categories"
      formFields={formFields}
      setFormFields={setFormFields}
      isLoading={isLoading}
      onSubmit={submit}
    >
      {usingSampleData && (
        <p className="admin-dash__sample-banner">Using sample configuration until live data is saved.</p>
      )}

      <div className="admin-dash__homepage-category-toolbar">
        <p className="admin-dash__hint">Add categories, upload a tile image, and set display order.</p>
        <button type="button" className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm" onClick={addItem}>
          <FaPlus />
          Add category
        </button>
      </div>

      {items.length === 0 ? (
        <p className="admin-dash__table-empty admin-dash__homepage-empty-block">No categories added yet.</p>
      ) : (
        <div className="admin-dash__homepage-category-list">
          {items.map((item, index) => {
            const rowKey = `${item.categoryId || "new"}-${index}`;
            const previews =
              imagePreviews[rowKey] ||
              (item.image ? [item.image] : []);

            return (
              <div key={rowKey} className="admin-dash__homepage-category-row">
                <div className="admin-dash__homepage-category-row-head">
                  <span className="admin-dash__homepage-sort-rank">{index + 1}</span>
                  <strong>Category tile</strong>
                  <div className="admin-dash__actions admin-dash__homepage-category-row-actions">
                    <button
                      type="button"
                      className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                      onClick={() => moveItem(index, -1)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      type="button"
                      className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                      onClick={() => moveItem(index, 1)}
                      disabled={index === items.length - 1}
                      title="Move down"
                    >
                      <FaArrowDown />
                    </button>
                    <button
                      type="button"
                      className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm"
                      onClick={() => removeItem(index)}
                      title="Remove"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>

                <div className="admin-dash__form-grid admin-dash__form-grid--2">
                  <Field label="Category" htmlFor={`category-${index}`}>
                    <select
                      className="admin-dash__select"
                      id={`category-${index}`}
                      value={item.categoryId || ""}
                      onChange={(e) => onCategoryChange(index, e.target.value)}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id || cat.id} value={cat._id || cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Display order" htmlFor={`order-${index}`}>
                    <input
                      className="admin-dash__input"
                      id={`order-${index}`}
                      type="number"
                      min="0"
                      value={item.displayOrder ?? index + 1}
                      onChange={(e) =>
                        updateItem(index, { displayOrder: e.target.value })
                      }
                    />
                  </Field>
                  <div className="admin-dash__field admin-dash__field--full">
                    <label className="admin-dash__label">Category image</label>
                    <div className="admin-dash__banner-upload-wrap">
                      <ImageUploadField
                        uploadEndpoint={homepageEndpoints.upload}
                        deleteImageEndpoint={homepageEndpoints.deleteImage}
                        previews={previews}
                        setPreviews={(next) => {
                          setImagePreviews((prev) => ({ ...prev, [rowKey]: next }));
                          updateItem(index, { image: next[0] || "" });
                        }}
                        setAlertBox={setAlertBox}
                        multiple={false}
                        maxImages={1}
                        clearStagingOnMount={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </HomepageSectionShell>
  );
}
