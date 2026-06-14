import { useState, useEffect, useContext } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";
import "./admin-dashboard.css";

export default function AdminLayout() {
  const [catData, setCatData] = useState({ categoryList: [] });
  const context = useContext(MyContext);

  const fetchCategory = () =>
    fetchDataFromApi("/api/category").then((res) => {
      if (res?.categoryList) setCatData(res);
      return res;
    });

  useEffect(() => {
    fetchCategory();
  }, []);

  const adminContextValue = {
    catData,
    fetchCategory,
    setAlertBox: context?.setAlertBox ?? (() => {}),
  };

  return (
    <div className="admin-dash">
      <AdminSidebar />
      <main className="admin-dash__main">
        <Outlet context={adminContextValue} />
      </main>
    </div>
  );
}
