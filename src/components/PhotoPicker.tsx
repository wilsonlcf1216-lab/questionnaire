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
    <div className="space-y-4">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-teal-500 hover:bg-teal-50">
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
        <div className="rounded-2xl bg-white p-3 text-teal-800 shadow-sm">
          <Camera className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-900">影相或上載照片</p>
        <p className="mt-1 text-xs leading-6 text-slate-500">
          支援手機相機、相簿、拖入檔案，系統會自動壓縮圖片方便匯出 Excel。
        </p>
      </label>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {photos.map((photo) => (
          <figure key={photo.id} className="overflow-hidden rounded-[20px] border border-slate-200 bg-white">
            <img src={photo.dataUrl} alt={photo.name} className="h-40 w-full object-cover" />
            <figcaption className="space-y-3 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{photo.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
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
          <div className="flex min-h-40 flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-white/60 p-4 text-center text-slate-400">
            <ImagePlus className="h-5 w-5" />
            <p className="mt-2 text-sm">未有相片</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
