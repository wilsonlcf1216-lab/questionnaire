import { AlertTriangle, MapPin, NotebookPen, Trash2 } from "lucide-react";

import { PhotoPicker } from "@/components/PhotoPicker";
import {
  CHECKLIST_STATUSES,
  type ChecklistItem,
  type InspectionItemResult,
  type InspectionPhoto,
} from "@/types/checklist";

interface ItemCardProps {
  item: ChecklistItem;
  result?: InspectionItemResult;
  onStatusChange: (sourceKey: string, itemId: string, status: InspectionItemResult["status"]) => void;
  onAddDefect: (sourceKey: string, itemId: string) => void;
  onUpdateDefectNote: (sourceKey: string, itemId: string, rowId: string, note: string) => void;
  onAddPhotos: (
    sourceKey: string,
    itemId: string,
    rowId: string,
    files: FileList | null,
    captureType: "zoom-in" | "zoom-out",
  ) => void;
  onRemoveDefect: (sourceKey: string, itemId: string, rowId: string) => void;
  onSetDefectPhoto: (
    sourceKey: string,
    itemId: string,
    rowId: string,
    captureType: "zoom-in" | "zoom-out",
    photo: InspectionPhoto | null,
  ) => void;
}

function getStatusTone(status: InspectionItemResult["status"]) {
  switch (status) {
    case "Pass":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Fail":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "N/A":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-slate-200 bg-white text-slate-500";
  }
}

export function ItemCard({
  item,
  result,
  onStatusChange,
  onAddDefect,
  onUpdateDefectNote,
  onAddPhotos,
  onRemoveDefect,
  onSetDefectPhoto,
}: ItemCardProps) {
  const status = result?.status ?? "";
  const isFail = status === "Fail";
  const defectRows = result?.defectRows ?? [];

  return (
    <article className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,rgba(240,253,250,0.95),rgba(255,255,255,0.96)_45%,rgba(241,245,249,0.92))] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white">
                {item.sheetLabel}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                {item.id}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
                {item.category}
              </span>
              <span className={`rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusTone(status)}`}>
                {status || "未選狀態"}
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-[28px] leading-tight text-slate-950 sm:text-[32px]">{item.element}</h3>
              <div className="max-w-4xl rounded-[24px] border border-teal-100 bg-white/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-700">
                  Critical Checking Instruction
                </p>
                <p className="mt-3 whitespace-pre-wrap text-[15px] font-medium leading-8 text-slate-700 sm:text-base">
                  {item.instruction}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
              <MapPin className="h-3.5 w-3.5" />
              {item.targetLocation || "Location not specified"}
            </div>
          </div>

          <div className="w-full max-w-[420px] rounded-[24px] border border-slate-200 bg-white/90 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Select Result</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
              {CHECKLIST_STATUSES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onStatusChange(item.sourceKey, item.id, option)}
                  className={`rounded-2xl border px-4 py-3.5 text-sm font-semibold transition ${
                    status === option
                      ? option === "Pass"
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-[0_14px_30px_rgba(5,150,105,0.22)]"
                        : option === "Fail"
                          ? "border-rose-600 bg-rose-600 text-white shadow-[0_14px_30px_rgba(225,29,72,0.2)]"
                          : "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-500 hover:bg-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isFail ? (
        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span className="inline-flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" />
              `Fail` 項目每個 defect 都要填 notes，同時要有 1 張 `Zoom In` 同 1 張 `Zoom Out`。
            </span>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                <NotebookPen className="h-3.5 w-3.5" />
                Defect Details
              </p>
            </div>

            <div className="space-y-4">
              {defectRows.map((row, index) => (
                <div key={row.id} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">Defect {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => onRemoveDefect(item.sourceKey, item.id, row.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,1fr)_minmax(280px,1fr)]">
                    <div className="rounded-[22px] border border-slate-200 bg-white p-3">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Notes
                      </p>
                      <input
                        type="text"
                        value={row.note}
                        onChange={(event) => onUpdateDefectNote(item.sourceKey, item.id, row.id, event.target.value)}
                        placeholder="例如：paint chip near door frame / glass scratch / closer not aligned"
                        className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
                      />
                    </div>

                    <PhotoPicker
                      title="Zoom In"
                      photo={row.zoomInPhoto}
                      onAdd={(files) => onAddPhotos(item.sourceKey, item.id, row.id, files, "zoom-in")}
                      onRemove={() => onSetDefectPhoto(item.sourceKey, item.id, row.id, "zoom-in", null)}
                    />

                    <PhotoPicker
                      title="Zoom Out"
                      photo={row.zoomOutPhoto}
                      onAdd={(files) => onAddPhotos(item.sourceKey, item.id, row.id, files, "zoom-out")}
                      onRemove={() => onSetDefectPhoto(item.sourceKey, item.id, row.id, "zoom-out", null)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => onAddDefect(item.sourceKey, item.id)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-700"
              >
                + Add Defect
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
