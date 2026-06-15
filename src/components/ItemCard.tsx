import { MapPin, NotebookPen } from "lucide-react";

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
    case "Pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
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

  return (
    <article className="rounded-[28px] border border-slate-200/80 bg-white/92 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white">
              {item.id}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
              {item.category}
            </span>
            <span className={`rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusTone(status)}`}>
              {status || "未選狀態"}
            </span>
          </div>
          <div>
            <h3 className="font-display text-[28px] leading-tight text-slate-900">{item.element}</h3>
            <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {item.instruction}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
            <MapPin className="h-3.5 w-3.5" />
            {item.targetLocation || "Location not specified"}
          </div>
        </div>

        <div className="grid min-w-[240px] gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {CHECKLIST_STATUSES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onStatusChange(item.sourceKey, item.id, option)}
              className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                status === option
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-500 hover:bg-white"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
            <NotebookPen className="h-3.5 w-3.5" />
            Notes / Defect Details
          </p>
          <textarea
            rows={7}
            value={result?.notes ?? ""}
            onChange={(event) => onNotesChange(item.sourceKey, item.id, event.target.value)}
            placeholder="例如：paint chip near door frame / glass scratch on lower panel / closer not aligned..."
            className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-teal-500"
          />
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
            Photo Evidence
          </p>
          <PhotoPicker
            photos={result?.photos ?? []}
            onAdd={(files) => onAddPhotos(item.sourceKey, item.id, files)}
            onRemove={(photoId) => onRemovePhoto(item.sourceKey, item.id, photoId)}
          />
        </div>
      </div>
    </article>
  );
}
