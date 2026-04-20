import type { CategorizationStatus } from "@/types";

const styles: Record<CategorizationStatus, string> = {
  REVIEWED: "bg-green-100 text-green-700",
  NEEDS_REVIEW: "bg-yellow-100 text-yellow-700",
  NEEDS_MORE_INFO: "bg-orange-100 text-orange-700",
};

const labels: Record<CategorizationStatus, string> = {
  REVIEWED: "Reviewed",
  NEEDS_REVIEW: "Needs Review",
  NEEDS_MORE_INFO: "Needs Info",
};

export function StatusBadge({ status }: { status: CategorizationStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
