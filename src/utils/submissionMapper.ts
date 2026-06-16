import type {
  ChecklistSheet,
  InspectionMeta,
  InspectionItemResult,
  SubmissionDetail,
  SubmissionItemRecord,
  SubmissionRecord,
} from "@/types/checklist";
import type {
  SubmissionInsertRow,
  SubmissionItemInsertRow,
  SubmissionPhotoInsertRow,
} from "@/types/supabase";
import { generateId } from "@/utils/id";
import { buildInspectionSummary } from "@/utils/checklistStats";

export function createSubmissionItemSourceKey(sheetName: string, itemId: string, element: string) {
  return `${sheetName}::${itemId}::${element}`;
}

export function buildSubmissionInsertRow(
  meta: InspectionMeta,
  sheets: ChecklistSheet[],
  results: Record<string, InspectionItemResult>,
): SubmissionInsertRow {
  const summary = buildInspectionSummary(sheets, results).overall;

  return {
    ward_name: meta.wardName,
    inspector_name: meta.inspectorName,
    inspection_date: meta.inspectionDate,
    handover_batch: meta.handoverBatch,
    remarks: meta.remarks,
    total_items: summary.total,
    pass_count: summary.pass,
    fail_count: summary.fail,
    pending_count: summary.unfilled,
    na_count: summary.na,
  };
}

export function buildSubmissionRecord(
  id: string,
  meta: InspectionMeta,
  sheets: ChecklistSheet[],
  results: Record<string, InspectionItemResult>,
): SubmissionRecord {
  const summary = buildInspectionSummary(sheets, results).overall;

  return {
    id,
    wardName: meta.wardName,
    inspectorName: meta.inspectorName,
    inspectionDate: meta.inspectionDate,
    handoverBatch: meta.handoverBatch,
    remarks: meta.remarks,
    submittedAt: new Date().toISOString(),
    totalItems: summary.total,
    passCount: summary.pass,
    failCount: summary.fail,
    pendingCount: summary.unfilled,
    naCount: summary.na,
  };
}

export function buildSubmissionItemRows(
  submissionId: string,
  sheets: ChecklistSheet[],
  results: Record<string, InspectionItemResult>,
): SubmissionItemInsertRow[] {
  return sheets.flatMap((sheet) =>
    sheet.items.map((item) => ({
      submission_id: submissionId,
      source_key: createSubmissionItemSourceKey(sheet.name, item.id, item.element),
      item_id: item.id,
      sheet_name: sheet.name,
      category: item.category,
      element: item.element,
      target_location: item.targetLocation,
      status: results[item.sourceKey]?.status || "",
      notes: results[item.sourceKey]?.notes || "",
    })),
  );
}

export function buildSubmissionDetail(
  id: string,
  meta: InspectionMeta,
  sheets: ChecklistSheet[],
  results: Record<string, InspectionItemResult>,
): SubmissionDetail {
  const record = buildSubmissionRecord(id, meta, sheets, results);
  const items: SubmissionItemRecord[] = sheets.flatMap((sheet) =>
    sheet.items.map((item) => ({
      id: generateId(),
      submissionId: id,
      itemId: item.id,
      sheetName: sheet.name,
      category: item.category,
      element: item.element,
      targetLocation: item.targetLocation,
      status: results[item.sourceKey]?.status || "",
      notes: results[item.sourceKey]?.notes || "",
      photos: (results[item.sourceKey]?.photos ?? []).map((photo, index) => ({
        id: generateId(),
        submissionItemId: item.sourceKey,
        fileName: photo.name,
        storagePath: `demo/${id}/${item.id}/${photo.name}`,
        photoUrl: photo.dataUrl,
        position: index,
      })),
    })),
  );

  return {
    ...record,
    items,
  };
}

export function buildPhotoInsertRows(params: {
  itemIdMap: Record<string, string>;
  submissionId: string;
  results: Record<string, InspectionItemResult>;
  photoUrlByItem: Record<string, Array<{ fileName: string; storagePath: string; photoUrl: string }>>;
}): SubmissionPhotoInsertRow[] {
  return Object.entries(params.photoUrlByItem).flatMap(([sourceKey, photos]) =>
    photos.map((photo, index) => ({
      submission_item_id: params.itemIdMap[sourceKey],
      file_name: photo.fileName,
      storage_path: photo.storagePath,
      photo_url: photo.photoUrl,
      position: index,
    })),
  );
}
