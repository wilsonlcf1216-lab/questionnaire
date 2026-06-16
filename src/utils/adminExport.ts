import JSZip from "jszip";

import type { SubmissionDetail, SubmissionRecord } from "@/types/checklist";
import { downloadBlob, sanitizeStorageSegment } from "@/utils/file";

function escapeCsv(value: string | number) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function buildCsv(rows: Array<Array<string | number>>) {
  return rows.map((row) => row.map((cell) => escapeCsv(cell ?? "")).join(",")).join("\n");
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

  const csv = buildCsv(rows);
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "submissions.csv");
}

function buildSubmissionDetailRows(detail: SubmissionDetail): Array<Array<string | number>> {
  return [
    ["submission_id", detail.id],
    ["ward_name", detail.wardName],
    ["inspector_name", detail.inspectorName],
    ["inspection_date", detail.inspectionDate],
    ["handover_batch", detail.handoverBatch],
    ["submitted_at", detail.submittedAt],
    [],
    [
      "submission_item_id",
      "item_id",
      "sheet_name",
      "category",
      "element",
      "target_location",
      "status",
      "notes",
      "photo_count",
      "photo_file_name",
      "photo_storage_path",
      "photo_url",
    ],
    ...detail.items.flatMap((item) => {
      if (item.photos.length === 0) {
        return [[
          item.id,
          item.itemId,
          item.sheetName,
          item.category,
          item.element,
          item.targetLocation,
          item.status,
          item.notes,
          0,
          "",
          "",
          "",
        ]];
      }

      return item.photos.map((photo) => [
        item.id,
        item.itemId,
        item.sheetName,
        item.category,
        item.element,
        item.targetLocation,
        item.status,
        item.notes,
        item.photos.length,
        photo.fileName,
        photo.storagePath,
        photo.photoUrl,
      ]);
    }),
  ];
}

export function exportSubmissionDetailCsv(detail: SubmissionDetail) {
  const rows = buildSubmissionDetailRows(detail);

  const csv = buildCsv(rows);

  downloadBlob(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
    `submission-${detail.id}.csv`,
  );
}

function inferFileExtension(contentType: string | null, fallbackName: string) {
  if (fallbackName.includes(".")) {
    return fallbackName.split(".").pop() || "jpg";
  }

  if (contentType?.includes("png")) {
    return "png";
  }

  if (contentType?.includes("webp")) {
    return "webp";
  }

  return "jpg";
}

async function fetchPhotoBlob(photoUrl: string) {
  const response = await fetch(photoUrl);
  if (!response.ok) {
    throw new Error(`未能下載相片：${photoUrl}`);
  }

  return response.blob();
}

export async function exportSubmissionZip(detail: SubmissionDetail) {
  const zip = new JSZip();
  const rootFolder = zip.folder(`submission-${detail.id}`);
  if (!rootFolder) {
    throw new Error("未能建立 ZIP 檔案");
  }

  rootFolder.file(
    "submission.csv",
    buildCsv(buildSubmissionDetailRows(detail)),
  );

  const photosFolder = rootFolder.folder("photos");
  if (!photosFolder) {
    throw new Error("未能建立相片資料夾");
  }

  for (const item of detail.items) {
    const itemFolder = photosFolder.folder(
      `${sanitizeStorageSegment(item.sheetName, "sheet")}/${sanitizeStorageSegment(item.itemId, "item")}/${sanitizeStorageSegment(item.category, "uncategorized")}`,
    );

    if (!itemFolder) {
      continue;
    }

    for (const [index, photo] of item.photos.entries()) {
      const blob = await fetchPhotoBlob(photo.photoUrl);
      const extension = inferFileExtension(blob.type, photo.fileName);
      const fileName = `${sanitizeStorageSegment(item.itemId, "item")}__${sanitizeStorageSegment(item.category, "uncategorized")}__${index + 1}.${extension}`;
      itemFolder.file(fileName, blob);
    }
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, `submission-${detail.id}.zip`);
}

export async function exportSubmissionPhotosZip(
  details: SubmissionDetail[],
  options?: { failOnly?: boolean },
) {
  const zip = new JSZip();
  const csvRows: Array<Array<string | number>> = [[
    "submission_id",
    "submission_item_id",
    "item_id",
    "sheet_name",
    "category",
    "element",
    "target_location",
    "status",
    "photo_index",
    "zip_file_name",
    "storage_path",
    "photo_url",
  ]];

  for (const detail of details) {
    for (const item of detail.items) {
      if (options?.failOnly && item.status !== "Fail") {
        continue;
      }

      for (const [index, photo] of item.photos.entries()) {
        const blob = await fetchPhotoBlob(photo.photoUrl);
        const extension = inferFileExtension(blob.type, photo.fileName);
        const fileName = [
          sanitizeStorageSegment(detail.id, "submission"),
          sanitizeStorageSegment(item.sheetName, "sheet"),
          sanitizeStorageSegment(item.itemId, "item"),
          sanitizeStorageSegment(item.category, "uncategorized"),
          `${index + 1}.${extension}`,
        ].join("__");

        zip.file(fileName, blob);
        csvRows.push([
          detail.id,
          item.id,
          item.itemId,
          item.sheetName,
          item.category,
          item.element,
          item.targetLocation,
          item.status,
          index + 1,
          fileName,
          photo.storagePath,
          photo.photoUrl,
        ]);
      }
    }
  }

  zip.file("photo-index.csv", buildCsv(csvRows));
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const prefix = options?.failOnly ? "fail-submission-photos" : "all-submission-photos";
  downloadBlob(zipBlob, `${prefix}-${new Date().toISOString().replace(/[:.]/g, "-")}.zip`);
}
