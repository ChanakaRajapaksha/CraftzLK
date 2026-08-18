import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FaCheck, FaEye } from "react-icons/fa";
import { MdDelete, MdQuestionAnswer } from "react-icons/md";
import { IoHelpCircleOutline } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import AdminConfirmDialog from "../../../Components/AdminDashboard/AdminConfirmDialog";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { deleteData, fetchDataFromApi, patchData, restoreSession } from "../../../utils/api";
import { useAppSelector } from "../../../store/hooks";
import {
  formatQuestionDate,
  getQuestionStatusBadgeClass,
  getQuestionStatusLabel,
  normalizeQuestion,
  QUESTION_STATUSES,
} from "./questionUtils";
import QuestionDetailsModal from "./QuestionDetailsModal";

function truncateQuestion(text, max = 72) {
  const value = String(text || "").trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}

export default function QuestionList() {
  const { setAlertBox } = useOutletContext();
  const isAuthInitialized = useAppSelector((state) => state.auth.isAuthInitialized);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [approvingAnswer, setApprovingAnswer] = useState(false);

  const showAlert = (error, msg) => {
    setAlertBox?.({ open: true, error, msg });
  };

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setLoadError(false);

    try {
      const sessionReady = await restoreSession();
      if (sessionReady !== true) {
        throw new Error("Login is required to load questions.");
      }

      const res = await fetchDataFromApi("/api/productQuestions/admin/list");
      if (
        !res ||
        res instanceof Error ||
        res?.response ||
        res?.isAxiosError ||
        res?.success === false
      ) {
        throw new Error(
          res?.response?.data?.message ||
            res?.message ||
            "Failed to load questions."
        );
      }

      const list = Array.isArray(res?.questionList)
        ? res.questionList
        : Array.isArray(res)
          ? res
          : [];

      setQuestions(list.map(normalizeQuestion));
    } catch {
      setQuestions([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isAuthInitialized) return;
    loadQuestions();
  }, [isAuthInitialized, loadQuestions]);

  const stats = useMemo(() => {
    const pendingCount = questions.filter((item) => item.status === "pending").length;
    const answeredCount = questions.filter((item) => item.status === "answered").length;
    return {
      total: questions.length,
      pendingCount,
      answeredCount,
    };
  }, [questions]);

  const filtered = useMemo(() => {
    let list = [...questions];

    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((item) =>
        [item.customerName, item.email, item.productName, item.question].some((v) =>
          String(v || "").toLowerCase().includes(q)
        )
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((item) => item.status === statusFilter);
    }

    return list.sort(
      (a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)
    );
  }, [questions, searchKeyword, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const slice = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const deleteQuestion = (id) => {
    deleteData(`/api/productQuestions/${id}`)
      .then((res) => {
        if (res?.success === false) {
          showAlert(true, res?.message || "Failed to delete question.");
          return;
        }
        showAlert(false, "Question deleted.");
        loadQuestions();
      })
      .catch(() => showAlert(true, "Failed to delete question."));
  };

  const requestDelete = (item) => {
    setDeleteTarget({
      id: item._id || item.id,
      label: `${item.customerName} on ${item.productName}`,
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteQuestion(deleteTarget.id);
    setDeleteTarget(null);
  };

  const applyQuestionUpdate = (updated) => {
    const normalized = normalizeQuestion(updated);
    const id = normalized._id || normalized.id;

    setQuestions((prev) =>
      prev.map((item) => ((item._id || item.id) === id ? normalized : item))
    );
    setViewTarget((current) =>
      current && (current._id || current.id) === id ? normalized : current
    );
  };

  const saveQuestionAnswer = (item, answer) => {
    const id = item._id || item.id;
    setSavingAnswer(true);

    patchData(`/api/productQuestions/${id}/answer`, { answer })
      .then((res) => {
        if (!res || res.success === false) {
          showAlert(true, res?.message || "Failed to save answer.");
          return;
        }
        applyQuestionUpdate(res);
        showAlert(false, "Answer saved.");
      })
      .catch(() => showAlert(true, "Failed to save answer."))
      .finally(() => setSavingAnswer(false));
  };

  const approveQuestionAnswer = (item, answer) => {
    const id = item._id || item.id;
    setApprovingAnswer(true);

    patchData(`/api/productQuestions/${id}/approve`, { answer })
      .then((res) => {
        if (!res || res.success === false) {
          showAlert(true, res?.message || "Failed to approve answer.");
          return;
        }
        applyQuestionUpdate(res);
        showAlert(false, "Answer approved.");
      })
      .catch(() => showAlert(true, "Failed to approve answer."))
      .finally(() => setApprovingAnswer(false));
  };

  const quickApproveQuestion = (item) => {
    const id = item._id || item.id;
    const answer = String(item.answer || "").trim();

    if (!answer) {
      showAlert(true, "Open the question and save an answer before approving.");
      setViewTarget(item);
      return;
    }

    setApprovingAnswer(true);
    patchData(`/api/productQuestions/${id}/approve`, { answer })
      .then((res) => {
        if (!res || res.success === false) {
          showAlert(true, res?.message || "Failed to approve answer.");
          return;
        }
        applyQuestionUpdate(res);
        showAlert(false, "Answer approved.");
      })
      .catch(() => showAlert(true, "Failed to approve answer."))
      .finally(() => setApprovingAnswer(false));
  };

  const emptyMessage = loadError
    ? "Unable to load questions. Please try again."
    : filtered.length === 0 && questions.length === 0
      ? "No questions yet. Customer submissions will appear here."
      : "No questions match your filters.";

  return (
    <>
      <AdminPageHeader
        title="Questions List"
        subtitle="View customer product questions submitted from the storefront."
        breadcrumbs={[{ label: "Review Management" }]}
      />

      <div className="admin-dash__stats">
        <StatCard icon={<MdQuestionAnswer />} label="Total questions" value={stats.total} />
        <StatCard
          icon={<IoHelpCircleOutline />}
          label="Pending"
          value={stats.pendingCount}
          gradient={["#a67c52", "#c9a961"]}
        />
        <StatCard
          icon={<MdQuestionAnswer />}
          label="Answered"
          value={stats.answeredCount}
          gradient={["#5a7a5e", "#7a9a7e"]}
        />
      </div>

      <section className="admin-dash__panel">
        <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters">
          <input
            className="admin-dash__input"
            style={{ maxWidth: "14rem" }}
            placeholder="Search questions…"
            aria-label="Search questions"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setPage(0);
            }}
          />
          <select
            className="admin-dash__select"
            style={{ maxWidth: "10rem" }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            aria-label="Filter by status"
          >
            <option value="all">All status</option>
            {QUESTION_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <AdminLoadingState message="Loading questions…" />
        ) : (
          <div className="admin-dash__data-table">
            <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
              <table className="admin-dash__table admin-dash__table--modern admin-dash__table--reviews">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Product</th>
                    <th>Question</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slice.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="admin-dash__table-empty">
                        {emptyMessage}
                      </td>
                    </tr>
                  ) : (
                    slice.map((item) => {
                      const id = item._id || item.id;

                      return (
                        <tr key={id}>
                          <td><strong>{item.customerName}</strong></td>
                          <td>{item.email || "—"}</td>
                          <td>{item.productName || "—"}</td>
                          <td className="admin-dash__review-comment" title={item.question}>
                            {truncateQuestion(item.question)}
                          </td>
                          <td>{formatQuestionDate(item.dateCreated)}</td>
                          <td>
                            <span
                              className={`admin-dash__status-badge admin-dash__status-badge--${getQuestionStatusBadgeClass(item.status)}`}
                            >
                              {getQuestionStatusLabel(item.status)}
                            </span>
                          </td>
                          <td>
                            <div className="admin-dash__actions admin-dash__actions--reviews">
                              <button
                                type="button"
                                className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                                title="View details"
                                onClick={() => setViewTarget(item)}
                              >
                                <FaEye />
                              </button>
                              <button
                                type="button"
                                className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                                title="Approve answer"
                                disabled={item.status === "answered" || approvingAnswer}
                                onClick={() => quickApproveQuestion(item)}
                              >
                                <FaCheck />
                              </button>
                              <button
                                type="button"
                                className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm admin-dash__btn--icon"
                                title="Delete"
                                onClick={() => requestDelete(item)}
                              >
                                <MdDelete />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <AdminPagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              itemLabel="questions"
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
              onPageChange={setPage}
              onRowsPerPageChange={(value) => {
                setRowsPerPage(value);
                setPage(0);
              }}
            />
          </div>
        )}
      </section>

      <QuestionDetailsModal
        open={Boolean(viewTarget)}
        question={viewTarget}
        onClose={() => setViewTarget(null)}
        onSaveAnswer={saveQuestionAnswer}
        onApproveAnswer={approveQuestionAnswer}
        saving={savingAnswer}
        approving={approvingAnswer}
      />

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete question?"
        message={
          deleteTarget
            ? `Are you sure you want to delete the question from "${deleteTarget.label}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
