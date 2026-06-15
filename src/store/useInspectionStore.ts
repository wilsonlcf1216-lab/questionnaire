import { create } from "zustand";

import {
  EMPTY_META,
  type ChecklistSheet,
  type InspectionDraft,
  type InspectionItemResult,
  type InspectionMeta,
  type InspectionPhoto,
} from "@/types/checklist";

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
  updateNotes: (sourceKey: string, itemId: string, notes: string) => void;
  appendPhotos: (sourceKey: string, itemId: string, photos: InspectionPhoto[]) => void;
  removePhoto: (sourceKey: string, itemId: string, photoId: string) => void;
  hydrateDraft: (draft: InspectionDraft) => void;
  markSaved: (message: string) => void;
  clearSaveMessage: () => void;
  clearDraftData: () => void;
}

function ensureResult(
  results: Record<string, InspectionItemResult>,
  sourceKey: string,
  itemId: string,
): InspectionItemResult {
  return (
    results[sourceKey] ?? {
      itemId,
      sourceKey,
      status: "",
      notes: "",
      photos: [],
      updatedAt: new Date().toISOString(),
    }
  );
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
  updateNotes: (sourceKey, itemId, notes) =>
    set((state) => ({
      results: {
        ...state.results,
        [sourceKey]: {
          ...ensureResult(state.results, sourceKey, itemId),
          notes,
          updatedAt: new Date().toISOString(),
        },
      },
      saveMessage: "",
    })),
  appendPhotos: (sourceKey, itemId, photos) =>
    set((state) => ({
      results: {
        ...state.results,
        [sourceKey]: {
          ...ensureResult(state.results, sourceKey, itemId),
          photos: [...ensureResult(state.results, sourceKey, itemId).photos, ...photos],
          updatedAt: new Date().toISOString(),
        },
      },
      saveMessage: "",
    })),
  removePhoto: (sourceKey, itemId, photoId) =>
    set((state) => {
      const current = ensureResult(state.results, sourceKey, itemId);
      return {
        results: {
          ...state.results,
          [sourceKey]: {
            ...current,
            photos: current.photos.filter((photo) => photo.id !== photoId),
            updatedAt: new Date().toISOString(),
          },
        },
        saveMessage: "",
      };
    }),
  hydrateDraft: (draft) =>
    set((state) => ({
      meta: draft.meta,
      results: draft.results,
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
