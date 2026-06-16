import type {
  ChecklistSheet,
  InspectionItemResult,
  InspectionMeta,
  SubmissionDetail,
  SubmissionRecord,
} from "@/types/checklist";
import { supabase } from "@/lib/supabase";
import { saveDemoSubmission } from "@/utils/demoSubmissionStore";
import { isSupabaseConfigured } from "@/utils/env";
import { generateId } from "@/utils/id";
import {
  buildPhotoInsertRows,
  buildSubmissionDetail,
  buildSubmissionInsertRow,
  buildSubmissionItemRows,
  buildSubmissionRecord,
  createSubmissionItemSourceKey,
} from "@/utils/submissionMapper";

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);base64/)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const length = binary.length;
  const bytes = new Uint8Array(length);

  for (let index = 0; index < length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mime });
}

async function uploadSubmissionPhotos(params: {
  submissionId: string;
  results: Record<string, InspectionItemResult>;
}) {
  if (!supabase) {
    return {};
  }

  const photoUrlByItem: Record<string, Array<{ fileName: string; storagePath: string; photoUrl: string }>> = {};

  for (const [sourceKey, result] of Object.entries(params.results)) {
    if (!result.photos.length) {
      continue;
    }

    photoUrlByItem[sourceKey] = [];

    for (const photo of result.photos) {
      const extension = photo.mimeType === "image/png" ? "png" : "jpg";
      const fileName = `${photo.id}.${extension}`;
      const storagePath = `${params.submissionId}/${result.itemId}/${fileName}`;
      const blob = dataUrlToBlob(photo.dataUrl);

      const uploadResult = await supabase.storage
        .from("submission-photos")
        .upload(storagePath, blob, { upsert: false, contentType: photo.mimeType });

      if (uploadResult.error) {
        throw new Error(`上傳相片失敗：${photo.name}`);
      }

      const publicUrl = supabase.storage.from("submission-photos").getPublicUrl(storagePath).data.publicUrl;

      photoUrlByItem[sourceKey].push({
        fileName: photo.name,
        storagePath,
        photoUrl: publicUrl,
      });
    }
  }

  return photoUrlByItem;
}

export async function submitInspection(params: {
  meta: InspectionMeta;
  sheets: ChecklistSheet[];
  results: Record<string, InspectionItemResult>;
}): Promise<{ submission: SubmissionRecord; detail: SubmissionDetail; mode: "supabase" | "demo" }> {
  if (!isSupabaseConfigured() || !supabase) {
    const id = generateId();
    const detail = buildSubmissionDetail(id, params.meta, params.sheets, params.results);
    saveDemoSubmission(detail);
    return {
      submission: buildSubmissionRecord(id, params.meta, params.sheets, params.results),
      detail,
      mode: "demo",
    };
  }

  const insertRow = buildSubmissionInsertRow(params.meta, params.sheets, params.results);
  const submissionResponse = await supabase
    .from("submissions")
    .insert(insertRow)
    .select("id, ward_name, inspector_name, inspection_date, handover_batch, remarks, submitted_at, total_items, pass_count, fail_count, pending_count, na_count")
    .single();

  if (submissionResponse.error || !submissionResponse.data) {
    const error = submissionResponse.error;
    const detail = error
      ? [error.message, error.details, error.hint, error.code].filter(Boolean).join(" / ")
      : "";
    throw new Error(
      `提交 submission 失敗：${detail || "請檢查 Supabase table / RLS 設定，並確認已在 SQL Editor 執行 schema.sql"}`,
    );
  }

  const submissionId = submissionResponse.data.id as string;
  const itemRows = buildSubmissionItemRows(submissionId, params.sheets, params.results);
  const itemResponse = await supabase
    .from("submission_items")
    .insert(itemRows)
    .select("id, source_key");

  if (itemResponse.error || !itemResponse.data) {
    const error = itemResponse.error;
    const detail = error ? [error.message, error.details, error.hint, error.code].filter(Boolean).join(" / ") : "";
    throw new Error(`寫入 item 資料失敗：${detail || "請檢查 submission_items table / RLS"}`);
  }

  const itemIdMap = itemResponse.data.reduce<Record<string, string>>((accumulator, row) => {
    accumulator[row.source_key as string] = row.id as string;
    return accumulator;
  }, {});

  const photoUrlByItem = await uploadSubmissionPhotos({
    submissionId,
    results: params.results,
  });

  const photoRows = buildPhotoInsertRows({
    itemIdMap,
    submissionId,
    results: params.results,
    photoUrlByItem,
  });

  if (photoRows.length > 0) {
    const photoResponse = await supabase.from("submission_item_photos").insert(photoRows);
    if (photoResponse.error) {
      const error = photoResponse.error;
      const detail = [error.message, error.details, error.hint, error.code].filter(Boolean).join(" / ");
      throw new Error(`相片資料索引寫入失敗：${detail || "請檢查 submission_item_photos table / RLS"}`);
    }
  }

  const detail = buildSubmissionDetail(submissionId, params.meta, params.sheets, params.results);
  detail.items = detail.items.map((item) => ({
    ...item,
    id: itemIdMap[createSubmissionItemSourceKey(item.sheetName, item.itemId, item.element)] ?? item.id,
    photos:
      photoUrlByItem[createSubmissionItemSourceKey(item.sheetName, item.itemId, item.element)]?.map((photo, index) => ({
        id: generateId(),
        submissionItemId:
          itemIdMap[createSubmissionItemSourceKey(item.sheetName, item.itemId, item.element)] ?? item.id,
        fileName: photo.fileName,
        storagePath: photo.storagePath,
        photoUrl: photo.photoUrl,
        position: index,
      })) ?? [],
  }));

  return {
    submission: buildSubmissionRecord(submissionId, params.meta, params.sheets, params.results),
    detail,
    mode: "supabase",
  };
}
