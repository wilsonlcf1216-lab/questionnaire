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
  updateStatus: (itemId: string, status: InspectionItemResult["status"]) => void;
  updateNotes: (itemId: string, notes: string) => void;
  appendPhotos: (itemId: string, photos: InspectionPhoto[]) => void;
  removePhoto: (itemId: string, photoId: string) => void;
  hydrateDraft: (draft: InspectionDraft) => void;
  markSaved: (message: string) => void;
  clearSaveMessage: () => void;
  clearDraftData: () => void;
}

function ensureResult(
  results: Record<string, InspectionItemResult>,
  itemId: string,
): InspectionItemResult {
  return (
    results[itemId] ?? {
      itemId,
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
  updateStatus: (itemId, status) =>
    set((state) => ({
      results: {
        ...state.results,
        [itemId]: {
          ...ensureResult(state.results, itemId),
          status,
          updatedAt: new Date().toISOString(),
        },
      },
      saveMessage: "",
    })),
  updateNotes: (itemId, notes) =>
    set((state) => ({
      results: {
        ...state.results,
        [itemId]: {
          ...ensureResult(state.results, itemId),
          notes,
          updatedAt: new Date().toISOString(),
        },
      },
      saveMessage: "",
    })),
  appendPhotos: (itemId, photos) =>
    set((state) => ({
      results: {
        ...state.results,
        [itemId]: {
          ...ensureResult(state.results, itemId),
          photos: [...ensureResult(state.results, itemId).photos, ...photos],
          updatedAt: new Date().toISOString(),
        },
      },
      saveMessage: "",
    })),
  removePhoto: (itemId, photoId) =>
    set((state) => {
      const current = ensureResult(state.results, itemId);
      return {
        results: {
          ...state.results,
          [itemId]: {
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
