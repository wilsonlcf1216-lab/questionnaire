import { ChevronRight, CircleAlert, ClipboardCheck } from "lucide-react";

import type { ChecklistSheet, InspectionSummary } from "@/types/checklist";

interface SectionNavProps {
  sheets: ChecklistSheet[];
  activeSheetName: string;
  summary: InspectionSummary;
  onSelect: (sheetName: string) => void;
}

export function SectionNav({ sheets, activeSheetName, summary, onSelect }: SectionNavProps) {
  return (
    <section className="rounded-[24px] border border-slate-200/80 bg-[#0f1722] p-5 text-white shadow-[0_20px_60px_rgba(2,6,23,0.2)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-2xl bg-white/10 p-2">
          <ClipboardCheck className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Checklist Zones</p>
          <h2 className="font-display text-2xl">區域導覽</h2>
        </div>
      </div>

      <div className="space-y-3">
        {sheets.map((sheet) => {
          const stats = summary.bySheet[sheet.name];
          const isActive = activeSheetName === sheet.name;

          return (
            <button
              key={sheet.name}
              type="button"
              onClick={() => onSelect(sheet.name)}
              className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                isActive
                  ? "border-teal-300/60 bg-teal-500/12 shadow-[inset_0_0_0_1px_rgba(94,234,212,0.14)]"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-100">{sheet.label}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {stats?.completed ?? 0}/{stats?.total ?? sheet.items.length} items completed
                  </p>
                </div>
                <ChevronRight className={`h-4 w-4 ${isActive ? "text-teal-200" : "text-slate-500"}`} />
              </div>

              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-200"
                  style={{ width: `${stats?.completionRate ?? 0}%` }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
                <span>Fail: {stats?.fail ?? 0}</span>
                <span>Pending: {stats?.pending ?? 0}</span>
                {stats?.fail ? (
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <CircleAlert className="h-3.5 w-3.5" />
                    Need follow-up
                  </span>
                ) : (
                  <span className="text-emerald-300">No fail yet</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
