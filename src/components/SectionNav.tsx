import type { ChecklistSheet, InspectionSummary } from "@/types/checklist";

interface SectionNavProps {
  sheets: ChecklistSheet[];
  activeSheetName: string;
  summary: InspectionSummary;
  onSelect: (sheetName: string) => void;
}

export function SectionNav({ sheets, activeSheetName, summary, onSelect }: SectionNavProps) {
  return (
    <section>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Check Zone</p>
      <div className="flex flex-wrap gap-2">
        {sheets.map((sheet) => {
          const stats = summary.bySheet[sheet.name];
          const isActive = activeSheetName === sheet.name;

          return (
            <button
              key={sheet.name}
              type="button"
              onClick={() => onSelect(sheet.name)}
              className={`inline-flex items-center rounded-full border px-4 py-2 text-sm transition ${
                isActive
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{sheet.label}</span>
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${
                  isActive ? "bg-white/14 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {stats?.completed ?? 0}/{stats?.total ?? sheet.items.length}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
