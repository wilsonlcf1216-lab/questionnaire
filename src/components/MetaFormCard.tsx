import { ClipboardList, UserRound } from "lucide-react";

import type { InspectionMeta } from "@/types/checklist";

interface MetaFormCardProps {
  meta: InspectionMeta;
  onChange: (field: keyof InspectionMeta, value: string) => void;
}

const fields: Array<{ key: keyof InspectionMeta; label: string; placeholder: string; type?: string }> = [
  { key: "wardName", label: "Ward / Area", placeholder: "例如 Ward 7A" },
  { key: "inspectorName", label: "Inspector", placeholder: "輸入檢查員姓名" },
  { key: "inspectionDate", label: "Inspection Date", placeholder: "", type: "date" },
  { key: "handoverBatch", label: "Handover Batch", placeholder: "例如 Phase 1 / Batch B" },
];

export function MetaFormCard({ meta, onChange }: MetaFormCardProps) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-teal-950 p-2 text-white">
          <ClipboardList className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Inspection Meta</p>
          <h2 className="font-display text-2xl text-slate-900">檢查基本資料</h2>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
              {field.label}
            </span>
            <input
              type={field.type ?? "text"}
              value={meta[field.key]}
              onChange={(event) => onChange(field.key, event.target.value)}
              placeholder={field.placeholder}
              className="w-full rounded-[16px] border border-slate-200 bg-[#f7f7f4] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
            />
          </label>
        ))}
      </div>

      <label className="mt-4 block space-y-2">
        <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
          <UserRound className="h-3.5 w-3.5" />
          General Remarks
        </span>
        <textarea
          rows={4}
          value={meta.remarks}
          onChange={(event) => onChange("remarks", event.target.value)}
          placeholder="可輸入總體備註、handover issue、跟進重點..."
          className="w-full rounded-[16px] border border-slate-200 bg-[#f7f7f4] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
        />
      </label>
    </section>
  );
}
