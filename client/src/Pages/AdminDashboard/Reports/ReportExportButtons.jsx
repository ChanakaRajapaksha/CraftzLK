import { useState } from "react";
import { MdPictureAsPdf, MdTableView } from "react-icons/md";
import ReportController from "../../../controllers/report.controller.js";
import { buildReportQueryParams } from "./useReportFilters";

export default function ReportExportButtons({
  reportType,
  filters = {},
  disabled = false,
}) {
  const [exporting, setExporting] = useState(null);
  const [error, setError] = useState("");

  const handleExport = async (format) => {
    if (!reportType || exporting) return;
    setError("");
    setExporting(format);

    const params = buildReportQueryParams(filters);
    params.set("format", format);
    const extension = format === "xlsx" ? "xlsx" : "pdf";
    const fallbackFilename = `${reportType}-report.${extension}`;

    const result = await ReportController.export(reportType, params, fallbackFilename);

    if (!result?.success) {
      setError(result?.message || "Export failed. Please try again.");
    }
    setExporting(null);
  };

  return (
    <div className="admin-dash__report-export">
      <div className="admin-dash__page-actions admin-dash__report-export-actions">
        <button
          type="button"
          className="admin-dash__btn admin-dash__btn--ghost"
          disabled={disabled || Boolean(exporting)}
          onClick={() => handleExport("pdf")}
        >
          <MdPictureAsPdf aria-hidden />
          {exporting === "pdf" ? "Exporting…" : "Export PDF"}
        </button>
        <button
          type="button"
          className="admin-dash__btn"
          disabled={disabled || Boolean(exporting)}
          onClick={() => handleExport("xlsx")}
        >
          <MdTableView aria-hidden />
          {exporting === "xlsx" ? "Exporting…" : "Export Excel"}
        </button>
      </div>
      {error ? (
        <p className="admin-dash__report-export-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
