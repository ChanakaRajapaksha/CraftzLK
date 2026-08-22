import { useCallback, useEffect, useState } from "react";
import { fetchDataFromApi } from "../../../utils/api";
import { buildReportQueryParams } from "./useReportFilters";

export default function useCustomerReport({
  preset,
  customStart,
  customEnd,
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
      categoryId: "all",
      productId: "all",
    });

    return fetchDataFromApi(`/api/reports/customers?${params.toString()}`)
      .then((res) => {
        if (!res || res.success === false) {
          throw new Error(res?.message || "Failed to load customer report.");
        }
        setData(res);
      })
      .catch(() => {
        setData(null);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [enabled, preset, customStart, customEnd]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return { data, loading, loadError, reload: loadReport };
}
