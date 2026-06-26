import { Camera, ImagePlus, Trash2 } from "lucide-react";

import type { InspectionPhoto } from "@/types/checklist";

interface PhotoPickerProps {
  title: string;
  photo: InspectionPhoto | null;
  onAdd: (files: FileList | null) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function PhotoPicker({ title, photo, onAdd, onRemove, disabled = false }: PhotoPickerProps) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-3">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</p>

      <label className="flex cursor-pointer items-center gap-3 rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-left transition hover:border-teal-500 hover:bg-teal-50">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          disabled={disabled}
          onChange={(event) => {
            onAdd(event.target.files);
            event.target.value = "";
          }}
          className="hidden"
        />
        <div className="rounded-2xl bg-white p-2.5 text-teal-800 shadow-sm">
          <Camera className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">加入 {title} 相片</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">每個 defect 呢欄只保留 1 張相。</p>
        </div>
      </label>

      {photo ? (
        <figure className="mt-3 overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50">
          <img src={photo.dataUrl} alt={photo.name} className="h-32 w-full object-cover" />
          <figcaption className="space-y-3 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-900">{photo.name}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {photo.width} x {photo.height}
                </p>
              </div>
              <button
                type="button"
                onClick={onRemove}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </figcaption>
        </figure>
      ) : (
        <div className="mt-3 flex min-h-32 flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-slate-400">
          <ImagePlus className="h-4.5 w-4.5" />
          <p className="mt-2 text-xs">未有 {title} 相片</p>
        </div>
      )}
    </div>
  );
}
