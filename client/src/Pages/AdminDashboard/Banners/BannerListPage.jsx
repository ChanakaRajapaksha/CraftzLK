import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { deleteData, fetchDataFromApi } from "../../../utils/api";
import { BANNER_MODULES } from "../adminModules";

export default function BannerListPage({ moduleKey }) {
  const config = BANNER_MODULES[moduleKey];
  const { setAlertBox } = useOutletContext();
  const [items, setItems] = useState([]);

  const load = () => {
    fetchDataFromApi(config.apiBase).then((res) => setItems(Array.isArray(res) ? res : []));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    load();
  }, [config.apiBase]);

  const deleteItem = (id) => {
    deleteData(`${config.apiBase}/${id}`).then(() => {
      setAlertBox?.({ open: true, error: false, msg: "Banner deleted." });
      load();
    });
  };

  return (
    <>
      <AdminPageHeader
        title={`${config.title} — List`}
        breadcrumbs={[{ label: config.title }]}
        action={
          <Link to={config.addPath} className="admin-dash__btn">
            Upload banner
          </Link>
        }
      />
      <section className="admin-dash__panel">
        <div className="admin-dash__table-wrap">
          <table className="admin-dash__table">
            <thead>
              <tr>
                <th>Image</th>
                {config.hasCategoryFields && (
                  <>
                    <th>Category</th>
                    <th>Sub category</th>
                  </>
                )}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id || item.id}>
                  <td>
                    <img
                      src={item.images?.[0]}
                      alt=""
                      style={{ width: "8rem", height: "4.5rem", objectFit: "cover", borderRadius: 10 }}
                    />
                  </td>
                  {config.hasCategoryFields && (
                    <>
                      <td>{item.catName || "—"}</td>
                      <td>{item.subCatName || "—"}</td>
                    </>
                  )}
                  <td>
                    <div className="admin-dash__actions">
                      <Link to={config.editPath(item._id || item.id)} className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm">
                        <FaPencilAlt />
                      </Link>
                      <button type="button" className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm" onClick={() => deleteItem(item._id || item.id)}>
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
