import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";
import {
  COLLECTIONS_ALL_PATH,
  getCategoryCollectionsPath,
  getSubcategoryCollectionsPath,
} from "../Collections/collectionsConstants";

function findInTree(categoryList, id) {
  for (const cat of categoryList || []) {
    if (String(cat._id) === String(id)) {
      return { type: "category", category: cat };
    }
    for (const child of cat.children || []) {
      if (String(child._id) === String(id)) {
        return { type: "subcategory", category: cat, subcategory: child };
      }
    }
  }
  return null;
}

async function resolveBrowsePath(id) {
  const res = await fetchDataFromApi(`/api/category/${id}`);
  const record = res?.category || res?.categoryData?.[0];
  if (!record?.name) return null;

  if (record.parentId) {
    const parentRes = await fetchDataFromApi(`/api/category/${record.parentId}`);
    const parent = parentRes?.category || parentRes?.categoryData?.[0];
    if (parent?.name) {
      return getSubcategoryCollectionsPath(parent.name, record.name);
    }
  }

  return getCategoryCollectionsPath(record.name);
}

const CategoryBrowseRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const go = async () => {
      const fromTree = findInTree(context?.categoryData, id);
      if (fromTree?.type === "category") {
        navigate(getCategoryCollectionsPath(fromTree.category.name), { replace: true });
        return;
      }
      if (fromTree?.type === "subcategory") {
        navigate(
          getSubcategoryCollectionsPath(fromTree.category.name, fromTree.subcategory.name),
          { replace: true }
        );
        return;
      }

      try {
        const path = await resolveBrowsePath(id);
        if (cancelled) return;
        navigate(path || COLLECTIONS_ALL_PATH, { replace: true });
      } catch {
        if (!cancelled) navigate(COLLECTIONS_ALL_PATH, { replace: true });
      } finally {
        if (!cancelled) setPending(false);
      }
    };

    go();
    return () => {
      cancelled = true;
    };
  }, [id, context?.categoryData, navigate]);

  if (!pending) return null;

  return (
    <div className="d-flex align-items-center justify-content-center py-5">
      <CircularProgress color="inherit" />
    </div>
  );
};

export default CategoryBrowseRedirect;
