import React, { useState, useEffect, useContext } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";
import "./admin.css";

export default function AdminLayout() {
  const [catData, setCatData] = useState({ categoryList: [] });
  const context = useContext(MyContext);

  const fetchCategory = () => {
    return fetchDataFromApi("/api/category").then((res) => {
      if (res && res.categoryList) setCatData(res);
      return res;
    });
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const adminContextValue = {
    catData,
    fetchCategory,
    setAlertBox: context?.setAlertBox ?? (() => {}),
    setProgress: () => {},
  };

  return (
    <div className="admin-main flex min-h-screen bg-slate-100">
      <div className="flex-shrink-0">
        <AdminSidebar />
      </div>
      <main className="flex-1 min-w-0">
        <div className="admin-right-content p-6">
          <Outlet context={adminContextValue} />
        </div>
      </main>
    </div>
  );
}
