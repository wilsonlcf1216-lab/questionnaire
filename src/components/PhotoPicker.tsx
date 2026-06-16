import { Camera, ImagePlus, Trash2 } from "lucide-react";

import type { InspectionPhoto } from "@/types/checklist";

interface PhotoPickerProps {
  photos: InspectionPhoto[];
  onAdd: (files: FileList | null) => void;
  onRemove: (photoId: string) => void;
  disabled?: boolean;
}

export function PhotoPicker({ photos, onAdd, onRemove, disabled = false }: PhotoPickerProps) {
  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center gap-3 rounded-[20px] border border-dashed border-slate-300 bg-white px-4 py-3 text-left transition hover:border-teal-500 hover:bg-teal-50">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          disabled={disabled}
          onChange={(event) => {
            onAdd(event.target.files);
            event.target.value = "";
          }}
          className="hidden"
        />
        <div className="rounded-2xl bg-slate-100 p-2.5 text-teal-800">
          <Camera className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">影相或上載照片</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            支援手機相機或相簿，系統會自動壓縮。
          </p>
        </div>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        {photos.map((photo) => (
          <figure key={photo.id} className="overflow-hidden rounded-[20px] border border-slate-200 bg-white">
            <img src={photo.dataUrl} alt={photo.name} className="h-28 w-full object-cover" />
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
                  onClick={() => onRemove(photo.id)}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </figcaption>
          </figure>
        ))}

        {photos.length === 0 ? (
          <div className="flex min-h-28 flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-white/60 p-4 text-center text-slate-400">
            <ImagePlus className="h-4.5 w-4.5" />
            <p className="mt-2 text-xs">未有相片</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
