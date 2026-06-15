import type { SubmissionDetail, SubmissionRecord } from "@/types/checklist";

const STORAGE_KEY = "ward-checklist-demo-submissions";

function readSubmissions(): SubmissionDetail[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as SubmissionDetail[];
  } catch {
    return [];
  }
}

function writeSubmissions(submissions: SubmissionDetail[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

export function saveDemoSubmission(submission: SubmissionDetail) {
  const existing = readSubmissions();
  writeSubmissions([submission, ...existing]);
}

export function listDemoSubmissions(): SubmissionRecord[] {
  return readSubmissions().map((submission) => ({
    id: submission.id,
    wardName: submission.wardName,
    inspectorName: submission.inspectorName,
    inspectionDate: submission.inspectionDate,
    handoverBatch: submission.handoverBatch,
    remarks: submission.remarks,
    submittedAt: submission.submittedAt,
    totalItems: submission.totalItems,
    passCount: submission.passCount,
    failCount: submission.failCount,
    pendingCount: submission.pendingCount,
    naCount: submission.naCount,
  }));
}

export function getDemoSubmission(submissionId: string): SubmissionDetail | null {
  return readSubmissions().find((submission) => submission.id === submissionId) ?? null;
}
