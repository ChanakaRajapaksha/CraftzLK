export const QUESTION_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "answered", label: "Answered" },
  { value: "archived", label: "Archived" },
];

export function formatQuestionDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getQuestionStatusBadgeClass(status) {
  if (status === "answered") return "completed";
  if (status === "archived") return "cancelled";
  return "pending";
}

export function getQuestionStatusLabel(status) {
  return QUESTION_STATUSES.find((item) => item.value === status)?.label || status || "Pending";
}

export function normalizeQuestion(question) {
  return {
    _id: question._id || question.id,
    id: question._id || question.id,
    customerId: question.customerId || "",
    customerName: question.customerName || "Customer",
    email: question.email || "",
    productId: question.productId || "",
    productName: question.productName || "Product",
    question: question.question || "",
    status: question.status || "pending",
    answer: question.answer || "",
    answerAuthor: question.answerAuthor || "CraftzLK",
    answerDate: question.answerDate || null,
    dateCreated: question.dateCreated,
  };
}
