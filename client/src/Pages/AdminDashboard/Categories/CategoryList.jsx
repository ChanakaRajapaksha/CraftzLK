import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { deleteData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function CategoryList() {
  const { setAlertBox } = useOutletContext();
  const [categories, setCategories] = useState([]);

  const load = () => {
    fetchDataFromApi("/api/category").then((res) => setCategories(res?.categoryList || []));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    load();
  }, []);

  const deleteCat = (id) => {
    deleteData(`/api/category/${id}`).then(() => {
      setAlertBox?.({ open: true, error: false, msg: "Category deleted." });
      load();
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Category List"
        subtitle="Manage top-level product categories."
        breadcrumbs={[{ label: "Category" }]}
        action={
          <Link to={`${ADMIN_BASE}/category/add`} className="admin-dash__btn">
            Add category
          </Link>
        }
      />
      <section className="admin-dash__panel">
        <div className="admin-dash__table-wrap">
          <table className="admin-dash__table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Color</th>
                <th>Sub categories</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td>
                    <img src={cat.images?.[0]} alt="" style={{ width: "3.5rem", height: "3.5rem", objectFit: "cover", borderRadius: 10 }} />
                  </td>
                  <td>{cat.name}</td>
                  <td>
                    <span className="admin-dash__badge">{cat.color}</span>
                  </td>
                  <td>{cat.children?.length || 0}</td>
                  <td>
                    <div className="admin-dash__actions">
                      <Link to={`${ADMIN_BASE}/category/edit/${cat._id}`} className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm">
                        <FaPencilAlt />
                      </Link>
                      <button type="button" className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm" onClick={() => deleteCat(cat._id)}>
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
