import { Camera, MapPin, NotebookPen } from "lucide-react";

import { PhotoPicker } from "@/components/PhotoPicker";
import { CHECKLIST_STATUSES, type ChecklistItem, type InspectionItemResult } from "@/types/checklist";

interface ItemCardProps {
  item: ChecklistItem;
  result?: InspectionItemResult;
  onStatusChange: (sourceKey: string, itemId: string, status: InspectionItemResult["status"]) => void;
  onNotesChange: (sourceKey: string, itemId: string, notes: string) => void;
  onAddPhotos: (sourceKey: string, itemId: string, files: FileList | null) => void;
  onRemovePhoto: (sourceKey: string, itemId: string, photoId: string) => void;
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
  onNotesChange,
  onAddPhotos,
  onRemovePhoto,
}: ItemCardProps) {
  const status = result?.status ?? "";
  const isFail = status === "Fail";

  return (
    <article className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,rgba(240,253,250,0.95),rgba(255,255,255,0.96)_45%,rgba(241,245,249,0.92))] px-5 py-5 sm:px-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white">
                  {item.id}
                </span>
                <h3 className="min-w-0 font-display text-[26px] leading-tight text-slate-950 sm:text-[30px]">
                  {item.element}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
                  {item.sheetLabel}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
                  <MapPin className="h-3.5 w-3.5" />
                  {item.targetLocation || "Location not specified"}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
                  {item.category}
                </span>
                <span className={`rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusTone(status)}`}>
                  {status || "未選狀態"}
                </span>
              </div>
            </div>

            <div className="rounded-[24px] border border-teal-100 bg-white/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-700">
                Critical Checking Instruction
              </p>
              <p className="mt-3 whitespace-pre-wrap text-[15px] font-medium leading-8 text-slate-700 sm:text-base">
                {item.instruction}
              </p>
            </div>
          </div>

          <div className="w-full rounded-[24px] border border-slate-200 bg-white/90 p-4">
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
            `Fail` 項目必須填寫 defect details，同時至少上載一張相片。
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(300px,0.75fr)]">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                <NotebookPen className="h-3.5 w-3.5" />
                Notes / Defect Details
              </p>
              <textarea
                rows={4}
                value={result?.notes ?? ""}
                onChange={(event) => onNotesChange(item.sourceKey, item.id, event.target.value)}
                placeholder="例如：paint chip near door frame / glass scratch on lower panel / closer not aligned..."
                className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-teal-500"
              />
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                <Camera className="h-3.5 w-3.5" />
                Photo Evidence
              </p>
              <PhotoPicker
                photos={result?.photos ?? []}
                onAdd={(files) => onAddPhotos(item.sourceKey, item.id, files)}
                onRemove={(photoId) => onRemovePhoto(item.sourceKey, item.id, photoId)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
