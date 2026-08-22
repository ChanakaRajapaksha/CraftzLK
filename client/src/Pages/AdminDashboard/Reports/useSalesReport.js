import { useCallback, useEffect, useState } from "react";
import { fetchDataFromApi } from "../../../utils/api";
import { buildReportQueryParams } from "./useReportFilters";

export default function useSalesReport({
  preset,
  customStart,
  customEnd,
  categoryId,
  productId,
  metric,
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
      metric,
    });

    return fetchDataFromApi(`/api/reports/sales?${params.toString()}`)
      .then((res) => {
        if (!res || res.success === false) {
          throw new Error(res?.message || "Failed to load sales report.");
        }
        setData(res);
      })
      .catch(() => {
        setData(null);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [enabled, preset, customStart, customEnd, categoryId, productId, metric]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return { data, loading, loadError, reload: loadReport };
}
