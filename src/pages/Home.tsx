import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle, Save, Send } from "lucide-react";

import { ItemCard } from "@/components/ItemCard";
import { MetaFormCard } from "@/components/MetaFormCard";
import { SectionNav } from "@/components/SectionNav";
import { SummaryPanel } from "@/components/SummaryPanel";
import { submitInspection } from "@/services/submissionService";
import { useInspectionStore } from "@/store/useInspectionStore";
import type { InspectionDraft } from "@/types/checklist";
import { buildInspectionSummary } from "@/utils/checklistStats";
import { preparePhoto } from "@/utils/image";
import { clearDraftFromStorage, loadDraftFromStorage, saveDraftToStorage } from "@/utils/storage";
import { loadTemplateWorkbook } from "@/utils/template";

function isMetaValid(meta: { wardName: string; inspectorName: string; inspectionDate: string }) {
  return Boolean(meta.wardName && meta.inspectorName && meta.inspectionDate);
}

export default function Home() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  const {
    templateName,
    templateBuffer,
    sheets,
    activeSheetName,
    loading,
    error,
    saveMessage,
    meta,
    results,
    setLoading,
    setError,
    initializeTemplate,
    setActiveSheet,
    updateMeta,
    updateStatus,
    updateNotes,
    appendPhotos,
    removePhoto,
    hydrateDraft,
    markSaved,
    clearDraftData,
  } = useInspectionStore();

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      try {
        const payload = await loadTemplateWorkbook();
        initializeTemplate(payload);

        const draft = await loadDraftFromStorage();
        if (draft && draft.templateName === payload.templateName) {
          hydrateDraft(draft);
        }
      } catch (setupError) {
        setError(setupError instanceof Error ? setupError.message : "初始化資料時發生錯誤");
      }
    }

    bootstrap();
  }, [hydrateDraft, initializeTemplate, setError, setLoading]);

  const summary = useMemo(() => buildInspectionSummary(sheets, results), [results, sheets]);

  const activeSheet = useMemo(
    () => sheets.find((sheet) => sheet.name === activeSheetName) ?? sheets[0],
    [activeSheetName, sheets],
  );

  async function handleSave() {
    try {
      setIsSaving(true);
      const draft: InspectionDraft = {
        templateName,
        meta,
        results,
        savedAt: new Date().toISOString(),
      };
      await saveDraftToStorage(draft);
      setActionError("");
      markSaved(`已儲存草稿 (${new Date().toLocaleTimeString()})`);
    } catch (saveError) {
      setActionError(saveError instanceof Error ? saveError.message : "儲存草稿失敗");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddPhotos(sourceKey: string, itemId: string, files: FileList | null) {
    if (!files?.length) {
      return;
    }

    try {
      const prepared = await Promise.all(Array.from(files).map((file) => preparePhoto(file)));
      appendPhotos(sourceKey, itemId, prepared);
      setActionError("");
    } catch (photoError) {
      setActionError(photoError instanceof Error ? photoError.message : "處理相片失敗");
    }
  }

  async function handleSubmit() {
    if (!templateBuffer) {
      setActionError("Template 尚未載入完成");
      return;
    }

    if (!isMetaValid(meta)) {
      setActionError("請先填寫 Ward、Inspector 同 Inspection Date，之後先可以提交");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await submitInspection({
        meta,
        sheets,
        results,
      });
      await clearDraftFromStorage();
      clearDraftData();
      navigate("/submitted", {
        state: {
          submission: response.submission,
          mode: response.mode,
        },
      });
      setActionError("");
    } catch (submitError) {
      setActionError(submitError instanceof Error ? submitError.message : "提交失敗");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f3ef]">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          讀取 Excel template 中...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f3ef] p-6">
        <div className="max-w-xl rounded-[28px] border border-rose-200 bg-white p-8 shadow-lg">
          <p className="text-xs uppercase tracking-[0.24em] text-rose-500">Unable To Continue</p>
          <h1 className="mt-3 font-display text-4xl text-slate-900">系統未能載入 checklist</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef2ec] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-6">
        {actionError ? (
          <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {actionError}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[370px_minmax(0,1fr)]">
          <div className="space-y-6 xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto xl:pr-1 xl:self-start">
            <MetaFormCard meta={meta} onChange={updateMeta} />
            <SectionNav
              sheets={sheets}
              activeSheetName={activeSheet?.name ?? ""}
              summary={summary}
              onSelect={setActiveSheet}
            />
            <SummaryPanel summary={summary} />
          </div>

          <main className="space-y-6">
            <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/92 shadow-sm backdrop-blur">
              <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,253,250,0.88))] px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Active Zone</p>
                    <h2 className="font-display text-3xl text-slate-950 sm:text-4xl">{activeSheet?.label}</h2>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[360px]">
                    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Items</p>
                      <p className="mt-2 text-3xl text-slate-950">{activeSheet?.items.length ?? 0}</p>
                    </div>
                    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Completed</p>
                      <p className="mt-2 text-3xl text-slate-950">{summary.bySheet[activeSheet?.name ?? ""]?.completed ?? 0}</p>
                    </div>
                    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Unfilled</p>
                      <p className="mt-2 text-3xl text-slate-950">{summary.bySheet[activeSheet?.name ?? ""]?.unfilled ?? 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 sm:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Check Zone
                </p>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {sheets.map((sheet) => {
                    const active = sheet.name === activeSheet?.name;
                    return (
                      <button
                        key={sheet.name}
                        type="button"
                        onClick={() => setActiveSheet(sheet.name)}
                        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                          active
                            ? "bg-slate-950 text-white"
                            : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                        }`}
                      >
                        {sheet.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="space-y-5">
              {(activeSheet?.items ?? []).map((item) => (
                <ItemCard
                  key={item.sourceKey}
                  item={item}
                  result={results[item.sourceKey]}
                  onStatusChange={updateStatus}
                  onNotesChange={updateNotes}
                  onAddPhotos={handleAddPhotos}
                  onRemovePhoto={removePhoto}
                />
              ))}

              {(activeSheet?.items ?? []).length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500">
                  呢個篩選條件之下未有 item。
                </div>
              ) : null}
            </section>

            <section className="pt-3">
              <div className="flex flex-col items-end gap-3">
                <div className="text-xs text-slate-500">{saveMessage || "未儲存最新更改"}</div>
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "儲存中..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white shadow-[0_20px_40px_rgba(15,23,42,0.16)] transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send className={`h-4 w-4 ${isSubmitting ? "animate-pulse" : ""}`} />
                    {isSubmitting ? "提交中..." : "Submit"}
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
