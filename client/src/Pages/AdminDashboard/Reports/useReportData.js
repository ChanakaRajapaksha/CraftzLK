import { useCallback, useEffect, useState } from "react";
import { fetchDataFromApi } from "../../../utils/api";
import { buildReportQueryParams } from "./useReportFilters";

export default function useReportData(endpoint, {
  preset,
  customStart,
  customEnd,
  categoryId = "all",
  productId = "all",
  enabled = true,
} = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadReport = useCallback(() => {
    if (!enabled || !endpoint) return undefined;

    setLoading(true);
    setLoadError(false);

    const params = buildReportQueryParams({
      preset,
      customStart,
      customEnd,
      categoryId,
      productId,
    });

    return fetchDataFromApi(`/api/reports/${endpoint}?${params.toString()}`)
      .then((res) => {
        if (!res || res.success === false) {
          throw new Error(res?.message || "Failed to load report.");
        }
        setData(res);
      })
      .catch(() => {
        setData(null);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [enabled, endpoint, preset, customStart, customEnd, categoryId, productId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return { data, loading, loadError, reload: loadReport };
}
