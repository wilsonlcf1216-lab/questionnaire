import type { SubmissionDetail, SubmissionRecord } from "@/types/checklist";
import { downloadBlob } from "@/utils/file";

function escapeCsv(value: string | number) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function exportSubmissionListCsv(submissions: SubmissionRecord[]) {
  const rows = [
    [
      "submission_id",
      "ward_name",
      "inspector_name",
      "inspection_date",
      "handover_batch",
      "submitted_at",
      "total_items",
      "pass_count",
      "fail_count",
      "pending_count",
      "na_count",
      "remarks",
    ],
    ...submissions.map((submission) => [
      submission.id,
      submission.wardName,
      submission.inspectorName,
      submission.inspectionDate,
      submission.handoverBatch,
      submission.submittedAt,
      submission.totalItems,
      submission.passCount,
      submission.failCount,
      submission.pendingCount,
      submission.naCount,
      submission.remarks,
    ]),
  ];

  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "submissions.csv");
}

export function exportSubmissionDetailCsv(detail: SubmissionDetail) {
  const rows = [
    ["submission_id", detail.id],
    ["ward_name", detail.wardName],
    ["inspector_name", detail.inspectorName],
    ["inspection_date", detail.inspectionDate],
    ["handover_batch", detail.handoverBatch],
    ["submitted_at", detail.submittedAt],
    [],
    [
      "item_id",
      "sheet_name",
      "category",
      "element",
      "target_location",
      "status",
      "notes",
      "photo_urls",
    ],
    ...detail.items.map((item) => [
      item.itemId,
      item.sheetName,
      item.category,
      item.element,
      item.targetLocation,
      item.status,
      item.notes,
      item.photos.map((photo) => photo.photoUrl).join(" | "),
    ]),
  ];

  const csv = rows
    .map((row) => row.map((cell) => escapeCsv(cell ?? "")).join(","))
    .join("\n");

  downloadBlob(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
    `submission-${detail.id}.csv`,
  );
}
