import { useCallback, useEffect, useState } from "react";
import ReportController from "../../../controllers/report.controller.js";
import { buildReportQueryParams } from "./useReportFilters";

export default function useProductReport({
  preset,
  customStart,
  customEnd,
  categoryId,
  productId,
  enabled = true,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadReport = useCallback(() => {
    if (!enabled) return undefined;

    setLoading(true);
    setLoadError(false);

    const params = buildReportQueryParams({
      preset,
      customStart,
      customEnd,
      categoryId,
      productId,
    });

    return ReportController.getProducts(params.toString())
      .then((res) => {
        if (!res || res.success === false) {
          throw new Error(res?.message || "Failed to load product report.");
        }
        setData(res);
      })
      .catch(() => {
        setData(null);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [enabled, preset, customStart, customEnd, categoryId, productId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return { data, loading, loadError, reload: loadReport };
}
