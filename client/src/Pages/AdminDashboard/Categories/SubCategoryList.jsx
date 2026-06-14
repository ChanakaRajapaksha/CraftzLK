import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { deleteData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function SubCategoryList() {
  const { setAlertBox } = useOutletContext();
  const [subCategories, setSubCategories] = useState([]);

  const load = () => {
    fetchDataFromApi("/api/category").then((res) => {
      const subs = [];
      (res?.categoryList || []).forEach((cat) => {
        (cat.children || []).forEach((sub) => subs.push({ ...sub, parentName: cat.name }));
      });
      setSubCategories(subs);
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    load();
  }, []);

  const deleteSub = (id) => {
    deleteData(`/api/category/${id}`).then(() => {
      setAlertBox?.({ open: true, error: false, msg: "Sub category deleted." });
      load();
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Sub Category List"
        breadcrumbs={[{ label: "Sub Category" }]}
        action={
          <Link to={`${ADMIN_BASE}/subCategory/add`} className="admin-dash__btn">
            Add sub category
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
                <th>Parent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subCategories.map((sub) => (
                <tr key={sub._id}>
                  <td>
                    <img src={sub.images?.[0]} alt="" style={{ width: "3.5rem", height: "3.5rem", objectFit: "cover", borderRadius: 10 }} />
                  </td>
                  <td>{sub.name}</td>
                  <td>{sub.parentName}</td>
                  <td>
                    <div className="admin-dash__actions">
                      <Link to={`${ADMIN_BASE}/subCategory/edit/${sub._id}`} className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm">
                        <FaPencilAlt />
                      </Link>
                      <button type="button" className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm" onClick={() => deleteSub(sub._id)}>
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
