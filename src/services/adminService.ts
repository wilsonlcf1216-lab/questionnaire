import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import type { SubmissionDetail, SubmissionItemPhotoRecord, SubmissionItemRecord, SubmissionRecord } from "@/types/checklist";
import { getDemoSubmission, listDemoSubmissions } from "@/utils/demoSubmissionStore";
import { isAllowedAdminEmail, isSupabaseConfigured } from "@/utils/env";

function mapSubmission(row: Record<string, unknown>): SubmissionRecord {
  return {
    id: String(row.id),
    wardName: String(row.ward_name ?? ""),
    inspectorName: String(row.inspector_name ?? ""),
    inspectionDate: String(row.inspection_date ?? ""),
    handoverBatch: String(row.handover_batch ?? ""),
    remarks: String(row.remarks ?? ""),
    submittedAt: String(row.submitted_at ?? ""),
    totalItems: Number(row.total_items ?? 0),
    passCount: Number(row.pass_count ?? 0),
    failCount: Number(row.fail_count ?? 0),
    pendingCount: Number(row.pending_count ?? 0),
    naCount: Number(row.na_count ?? 0),
  };
}

export async function sendAdminMagicLink(email: string) {
  if (!supabase) {
    throw new Error("尚未設定 Supabase，未能寄出 magic link");
  }

  const response = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}admin`,
    },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }
}

export async function getAdminSession(): Promise<Session | null> {
  if (!supabase) {
    return null;
  }

  const response = await supabase.auth.getSession();
  return response.data.session;
}

export async function signOutAdmin() {
  if (!supabase) {
    return;
  }

  await supabase.auth.signOut();
}

export function canAccessAdmin(session: Session | null) {
  if (!isSupabaseConfigured()) {
    return true;
  }

  return isAllowedAdminEmail(session?.user?.email ?? null);
}

export async function fetchSubmissionList(): Promise<{ mode: "supabase" | "demo"; submissions: SubmissionRecord[] }> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      mode: "demo",
      submissions: listDemoSubmissions(),
    };
  }

  const response = await supabase
    .from("submissions")
    .select("id, ward_name, inspector_name, inspection_date, handover_batch, remarks, submitted_at, total_items, pass_count, fail_count, pending_count, na_count")
    .order("submitted_at", { ascending: false });

  if (response.error) {
    throw new Error("未能讀取 submission 列表");
  }

  return {
    mode: "supabase",
    submissions: (response.data ?? []).map((row) => mapSubmission(row as Record<string, unknown>)),
  };
}

export async function fetchSubmissionDetail(submissionId: string): Promise<SubmissionDetail | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return getDemoSubmission(submissionId);
  }

  const submissionResponse = await supabase
    .from("submissions")
    .select("id, ward_name, inspector_name, inspection_date, handover_batch, remarks, submitted_at, total_items, pass_count, fail_count, pending_count, na_count")
    .eq("id", submissionId)
    .single();

  if (submissionResponse.error || !submissionResponse.data) {
    throw new Error("未能讀取 submission 詳情");
  }

  const itemResponse = await supabase
    .from("submission_items")
    .select("id, submission_id, item_id, sheet_name, category, element, target_location, status, notes")
    .eq("submission_id", submissionId)
    .order("sheet_name", { ascending: true });

  if (itemResponse.error) {
    throw new Error("未能讀取 submission items");
  }

  const photoResponse = await supabase
    .from("submission_item_photos")
    .select("id, submission_item_id, file_name, storage_path, photo_url, position")
    .in("submission_item_id", (itemResponse.data ?? []).map((row) => row.id));

  if (photoResponse.error) {
    throw new Error("未能讀取相片資料");
  }

  const photoMap = (photoResponse.data ?? []).reduce<Record<string, SubmissionItemPhotoRecord[]>>((accumulator, row) => {
    const photo: SubmissionItemPhotoRecord = {
      id: String(row.id),
      submissionItemId: String(row.submission_item_id),
      fileName: String(row.file_name),
      storagePath: String(row.storage_path),
      photoUrl: String(row.photo_url),
      position: Number(row.position ?? 0),
    };

    accumulator[photo.submissionItemId] = [...(accumulator[photo.submissionItemId] ?? []), photo];
    return accumulator;
  }, {});

  const items: SubmissionItemRecord[] = (itemResponse.data ?? []).map((row) => ({
    id: String(row.id),
    submissionId: String(row.submission_id),
    itemId: String(row.item_id),
    sheetName: String(row.sheet_name),
    category: String(row.category ?? ""),
    element: String(row.element ?? ""),
    targetLocation: String(row.target_location ?? ""),
    status: String(row.status ?? "") as SubmissionItemRecord["status"],
    notes: String(row.notes ?? ""),
    photos: (photoMap[String(row.id)] ?? []).sort((a, b) => a.position - b.position),
  }));

  return {
    ...mapSubmission(submissionResponse.data as Record<string, unknown>),
    items,
  };
}
