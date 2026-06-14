import { useEffect, useRef, useState } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useOutletContext } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { deleteData, editData, fetchDataFromApi, postData } from "../../../utils/api";
import { PRODUCT_ATTRIBUTE_MODULES } from "../adminModules";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";

export default function ProductAttributePage({ moduleKey }) {
  const config = PRODUCT_ATTRIBUTE_MODULES[moduleKey];
  const { setAlertBox } = useOutletContext();
  const [editId, setEditId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [value, setValue] = useState("");
  const inputRef = useRef();

  const load = () => {
    fetchDataFromApi(config.apiBase).then((res) => setItems(Array.isArray(res) ? res : []));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    load();
  }, [config.apiBase]);

  const submit = (e) => {
    e.preventDefault();
    if (!value.trim()) {
      setAlertBox?.({ open: true, error: true, msg: `Please enter ${config.fieldLabel}.` });
      return;
    }
    setIsLoading(true);
    const payload = { [config.fieldName]: value };
    const req = editId
      ? editData(`${config.apiBase}/${editId}`, payload)
      : postData(`${config.apiBase}/create`, payload);
    req.then(() => {
      setIsLoading(false);
      setValue("");
      setEditId("");
      load();
    });
  };

  const deleteItem = (id) => {
    deleteData(`${config.apiBase}/${id}`).then(load);
  };

  const startEdit = (id) => {
    inputRef.current?.focus();
    fetchDataFromApi(`${config.apiBase}/${id}`).then((res) => {
      setEditId(id);
      setValue(res?.[config.fieldName] ?? "");
    });
  };

  return (
    <>
      <AdminPageHeader
        title={config.title}
        breadcrumbs={[{ label: "Products", to: `${ADMIN_BASE}/products` }, { label: config.breadcrumb }]}
      />
      <form onSubmit={submit}>
        <section className="admin-dash__panel">
          <div className="admin-dash__field">
            <label className="admin-dash__label" htmlFor="attr">{config.fieldLabel}</label>
            <input
              ref={inputRef}
              className="admin-dash__input"
              id="attr"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <button type="submit" className="admin-dash__btn" disabled={isLoading}>
            {isLoading ? "Saving…" : editId ? "Update" : "Add"}
          </button>
        </section>
      </form>
      <section className="admin-dash__panel">
        <h2 className="admin-dash__panel-title">Existing values</h2>
        <div className="admin-dash__table-wrap">
          <table className="admin-dash__table">
            <thead>
              <tr>
                <th>{config.fieldLabel}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{item[config.fieldName]}</td>
                  <td>
                    <div className="admin-dash__actions">
                      <button type="button" className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm" onClick={() => startEdit(item._id)}>
                        <FaPencilAlt />
                      </button>
                      <button type="button" className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm" onClick={() => deleteItem(item._id)}>
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
