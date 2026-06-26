import { create } from "zustand";

import {
  EMPTY_META,
  type ChecklistSheet,
  type InspectionDefectRow,
  type InspectionDraft,
  type InspectionItemResult,
  type InspectionMeta,
  type InspectionPhoto,
} from "@/types/checklist";
import { generateId } from "@/utils/id";

interface InspectionState {
  templateName: string;
  templateBuffer: ArrayBuffer | null;
  sheets: ChecklistSheet[];
  activeSheetName: string;
  loading: boolean;
  error: string;
  saveMessage: string;
  meta: InspectionMeta;
  results: Record<string, InspectionItemResult>;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  initializeTemplate: (payload: {
    templateName: string;
    templateBuffer: ArrayBuffer;
    sheets: ChecklistSheet[];
  }) => void;
  setActiveSheet: (sheetName: string) => void;
  updateMeta: (field: keyof InspectionMeta, value: string) => void;
  updateStatus: (sourceKey: string, itemId: string, status: InspectionItemResult["status"]) => void;
  addDefectRow: (sourceKey: string, itemId: string) => void;
  updateDefectNote: (sourceKey: string, itemId: string, rowId: string, note: string) => void;
  setDefectPhoto: (
    sourceKey: string,
    itemId: string,
    rowId: string,
    captureType: "zoom-in" | "zoom-out",
    photo: InspectionPhoto | null,
  ) => void;
  removeDefectRow: (sourceKey: string, itemId: string, rowId: string) => void;
  hydrateDraft: (draft: InspectionDraft) => void;
  markSaved: (message: string) => void;
  clearSaveMessage: () => void;
  clearDraftData: () => void;
}

function createEmptyDefectRow(): InspectionDefectRow {
  return {
    id: generateId(),
    note: "",
    zoomInPhoto: null,
    zoomOutPhoto: null,
  };
}

function flattenDefectRows(defectRows: InspectionDefectRow[]) {
  const populatedRows = defectRows.filter(
    (row) => row.note.trim() || row.zoomInPhoto || row.zoomOutPhoto,
  );

  return {
    notes: populatedRows
      .map((row, index) => (row.note.trim() ? `${index + 1}. ${row.note.trim()}` : ""))
      .filter(Boolean)
      .join("\n"),
    photos: populatedRows.flatMap((row) =>
      [row.zoomInPhoto, row.zoomOutPhoto].filter((photo): photo is InspectionPhoto => Boolean(photo)),
    ),
  };
}

function normalizeResult(result: InspectionItemResult | undefined, sourceKey: string, itemId: string): InspectionItemResult {
  if (!result) {
    const defectRows = [createEmptyDefectRow()];
    return {
      itemId,
      sourceKey,
      status: "",
      notes: "",
      photos: [],
      defectRows,
      updatedAt: new Date().toISOString(),
    };
  }

  if (result.defectRows?.length) {
    const flattened = flattenDefectRows(result.defectRows);
    return {
      ...result,
      notes: flattened.notes,
      photos: flattened.photos,
      defectRows: result.defectRows,
    };
  }

  const noteLines = result.notes
    ? result.notes
        .split("\n")
        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    : [];
  const zoomInPhotos = (result.photos ?? []).filter((photo) => photo.captureType !== "zoom-out");
  const zoomOutPhotos = (result.photos ?? []).filter((photo) => photo.captureType === "zoom-out");
  const rowCount = Math.max(noteLines.length, zoomInPhotos.length, zoomOutPhotos.length, 1);
  const defectRows = Array.from({ length: rowCount }, (_, index) => ({
    id: generateId(),
    note: noteLines[index] ?? "",
    zoomInPhoto: zoomInPhotos[index] ?? null,
    zoomOutPhoto: zoomOutPhotos[index] ?? null,
  }));
  const flattened = flattenDefectRows(defectRows);

  return {
    ...result,
    notes: flattened.notes,
    photos: flattened.photos,
    defectRows,
  };
}

function ensureResult(
  results: Record<string, InspectionItemResult>,
  sourceKey: string,
  itemId: string,
): InspectionItemResult {
  return normalizeResult(results[sourceKey], sourceKey, itemId);
}

export const useInspectionStore = create<InspectionState>((set, get) => ({
  templateName: "",
  templateBuffer: null,
  sheets: [],
  activeSheetName: "",
  loading: true,
  error: "",
  saveMessage: "",
  meta: EMPTY_META,
  results: {},
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  initializeTemplate: ({ templateName, templateBuffer, sheets }) =>
    set({
      templateName,
      templateBuffer,
      sheets,
      activeSheetName: sheets[0]?.name ?? "",
      loading: false,
      error: "",
    }),
  setActiveSheet: (activeSheetName) => set({ activeSheetName }),
  updateMeta: (field, value) =>
    set((state) => ({
      meta: {
        ...state.meta,
        [field]: value,
      },
      saveMessage: "",
    })),
  updateStatus: (sourceKey, itemId, status) =>
    set((state) => ({
      results: {
        ...state.results,
        [sourceKey]: {
          ...ensureResult(state.results, sourceKey, itemId),
          status,
          updatedAt: new Date().toISOString(),
        },
      },
      saveMessage: "",
    })),
  addDefectRow: (sourceKey, itemId) =>
    set((state) => {
      const current = ensureResult(state.results, sourceKey, itemId);
      const defectRows = [...current.defectRows, createEmptyDefectRow()];
      const flattened = flattenDefectRows(defectRows);
      return {
        results: {
          ...state.results,
          [sourceKey]: {
            ...current,
            ...flattened,
            defectRows,
            updatedAt: new Date().toISOString(),
          },
        },
        saveMessage: "",
      };
    }),
  updateDefectNote: (sourceKey, itemId, rowId, note) =>
    set((state) => {
      const current = ensureResult(state.results, sourceKey, itemId);
      const defectRows = current.defectRows.map((row) => (row.id === rowId ? { ...row, note } : row));
      const flattened = flattenDefectRows(defectRows);
      return {
        results: {
          ...state.results,
          [sourceKey]: {
            ...current,
            ...flattened,
            defectRows,
            updatedAt: new Date().toISOString(),
          },
        },
        saveMessage: "",
      };
    }),
  setDefectPhoto: (sourceKey, itemId, rowId, captureType, photo) =>
    set((state) => {
      const current = ensureResult(state.results, sourceKey, itemId);
      const defectRows = current.defectRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              ...(captureType === "zoom-in"
                ? { zoomInPhoto: photo ? { ...photo, captureType, defectRowId: rowId } : null }
                : { zoomOutPhoto: photo ? { ...photo, captureType, defectRowId: rowId } : null }),
            }
          : row,
      );
      const flattened = flattenDefectRows(defectRows);
      return {
        results: {
          ...state.results,
          [sourceKey]: {
            ...current,
            ...flattened,
            defectRows,
            updatedAt: new Date().toISOString(),
          },
        },
        saveMessage: "",
      };
    }),
  removeDefectRow: (sourceKey, itemId, rowId) =>
    set((state) => {
      const current = ensureResult(state.results, sourceKey, itemId);
      const defectRows = current.defectRows.filter((row) => row.id !== rowId);
      const nextRows = defectRows.length ? defectRows : [createEmptyDefectRow()];
      const flattened = flattenDefectRows(nextRows);
      return {
        results: {
          ...state.results,
          [sourceKey]: {
            ...current,
            ...flattened,
            defectRows: nextRows,
            updatedAt: new Date().toISOString(),
          },
        },
        saveMessage: "",
      };
    }),
  hydrateDraft: (draft) =>
    set((state) => ({
      meta: draft.meta,
      results: Object.fromEntries(
        Object.entries(draft.results).map(([sourceKey, result]) => [
          sourceKey,
          normalizeResult(result, sourceKey, result.itemId),
        ]),
      ),
      saveMessage: `已恢復上次草稿（${new Date(draft.savedAt).toLocaleString()}）`,
      loading: false,
      activeSheetName: state.activeSheetName || state.sheets[0]?.name || "",
    })),
  markSaved: (saveMessage) => set({ saveMessage }),
  clearSaveMessage: () => set({ saveMessage: "" }),
  clearDraftData: () =>
    set({
      meta: EMPTY_META,
      results: {},
      activeSheetName: get().sheets[0]?.name ?? "",
      saveMessage: "",
    }),
}));
