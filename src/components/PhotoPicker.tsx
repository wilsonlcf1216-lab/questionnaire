import { Camera, ImagePlus, Search, Telescope, Trash2 } from "lucide-react";

import type { InspectionPhoto } from "@/types/checklist";

interface PhotoPickerProps {
  photos: InspectionPhoto[];
  onAdd: (files: FileList | null, captureType: "zoom-in" | "zoom-out") => void;
  onRemove: (photoId: string) => void;
  disabled?: boolean;
}

export function PhotoPicker({ photos, onAdd, onRemove, disabled = false }: PhotoPickerProps) {
  const zoomGroups: Array<{
    key: "zoom-in" | "zoom-out";
    title: string;
    description: string;
    icon: typeof Search;
    photos: InspectionPhoto[];
  }> = [
    {
      key: "zoom-in",
      title: "Zoom In",
      description: "近距離影缺陷細節、裂痕、崩角、刮花位。",
      icon: Search,
      photos: photos.filter((photo) => photo.captureType !== "zoom-out"),
    },
    {
      key: "zoom-out",
      title: "Zoom Out",
      description: "遠距離影全景，交代缺陷位置同周邊環境。",
      icon: Telescope,
      photos: photos.filter((photo) => photo.captureType === "zoom-out"),
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {zoomGroups.map((group) => {
        const Icon = group.icon;

        return (
          <div key={group.key} className="rounded-[22px] border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Icon className="h-4 w-4 text-teal-700" />
                  {group.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{group.description}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500">
                {group.photos.length} 張
              </span>
            </div>

            <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-left transition hover:border-teal-500 hover:bg-teal-50">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                disabled={disabled}
                onChange={(event) => {
                  onAdd(event.target.files, group.key);
                  event.target.value = "";
                }}
                className="hidden"
              />
              <div className="rounded-2xl bg-white p-2.5 text-teal-800 shadow-sm">
                <Camera className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">加入 {group.title} 相片</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">支援手機相機或相簿，系統會自動壓縮。</p>
              </div>
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {group.photos.map((photo) => (
                <figure key={photo.id} className="overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50">
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

              {group.photos.length === 0 ? (
                <div className="flex min-h-28 flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-slate-400 sm:col-span-2">
                  <ImagePlus className="h-4.5 w-4.5" />
                  <p className="mt-2 text-xs">未有 {group.title} 相片</p>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
