export type ChecklistStatus = "Pass" | "Fail" | "Pending" | "N/A";

export interface ChecklistItem {
  id: string;
  sheetName: string;
  sheetLabel: string;
  category: string;
  element: string;
  instruction: string;
  targetLocation: string;
  rowNumber: number;
  statusColumn: number;
  notesColumn: number;
  lastColumn: number;
}

export interface ChecklistSheet {
  name: string;
  label: string;
  items: ChecklistItem[];
  lastColumn: number;
}

export interface InspectionPhoto {
  id: string;
  name: string;
  mimeType: string;
  dataUrl: string;
  width: number;
  height: number;
  createdAt: string;
}

export interface InspectionItemResult {
  itemId: string;
  status: ChecklistStatus | "";
  notes: string;
  photos: InspectionPhoto[];
  updatedAt: string;
}

export interface InspectionMeta {
  wardName: string;
  inspectorName: string;
  inspectionDate: string;
  handoverBatch: string;
  remarks: string;
}

export interface InspectionDraft {
  templateName: string;
  meta: InspectionMeta;
  results: Record<string, InspectionItemResult>;
  savedAt: string;
}

export interface TemplatePayload {
  templateName: string;
  templateBuffer: ArrayBuffer;
  sheets: ChecklistSheet[];
}

export interface SheetStats {
  total: number;
  completed: number;
  pending: number;
  pass: number;
  fail: number;
  na: number;
  completionRate: number;
}

export interface InspectionSummary {
  overall: SheetStats;
  bySheet: Record<string, SheetStats>;
}

export const CHECKLIST_STATUSES: ChecklistStatus[] = ["Pass", "Fail", "Pending", "N/A"];

export const EMPTY_META: InspectionMeta = {
  wardName: "",
  inspectorName: "",
  inspectionDate: "",
  handoverBatch: "",
  remarks: "",
};
