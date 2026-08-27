import { useCallback, useEffect, useState } from "react";
import DashboardController from "../../../controllers/dashboard.controller.js";

export default function useDashboard({ preset, customStart, customEnd, metric }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadDashboard = useCallback(() => {
    setLoading(true);
    setLoadError(false);

    const params = new URLSearchParams({
      preset: preset || "today",
      metric: metric || "revenue",
    });

    if (preset === "custom") {
      if (customStart) params.set("customStart", customStart);
      if (customEnd) params.set("customEnd", customEnd);
    }

    return DashboardController.getOverview(params.toString())
      .then((res) => {
        if (!res || res.success === false) {
          throw new Error(res?.message || "Failed to load dashboard.");
        }
        setData(res);
      })
      .catch(() => {
        setData(null);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [preset, customStart, customEnd, metric]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return { data, loading, loadError, reload: loadDashboard };
}
