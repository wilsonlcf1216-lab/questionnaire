import { CheckCircle2, CircleDashed, ListChecks, XCircle } from "lucide-react";

import type { InspectionSummary } from "@/types/checklist";

interface SummaryPanelProps {
  summary: InspectionSummary;
}

const cards = [
  { key: "pass", label: "Passed", icon: CheckCircle2, accent: "text-emerald-700 bg-emerald-100" },
  { key: "fail", label: "Failed", icon: XCircle, accent: "text-rose-700 bg-rose-100" },
  { key: "na", label: "N/A", icon: CircleDashed, accent: "text-slate-700 bg-slate-100" },
] as const;

export function SummaryPanel({ summary }: SummaryPanelProps) {
  return (
    <section className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Live Summary</p>
          <h2 className="font-display text-2xl text-slate-900">進度總覽</h2>
        </div>
        <div className="rounded-full bg-slate-950 px-4 py-2 text-xs font-medium text-white">
          Completion {summary.overall.completionRate}%
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const value = summary.overall[card.key];

          return (
            <div key={card.key} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
                  <p className="mt-2 text-3xl text-slate-900">{value}</p>
                </div>
                <div className={`rounded-2xl p-3 ${card.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Unfilled</p>
              <p className="mt-2 text-3xl text-slate-900">{summary.overall.unfilled}</p>
            </div>
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <ListChecks className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Checked</p>
              <p className="mt-2 text-3xl text-slate-900">
                {summary.overall.completed}/{summary.overall.total}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Total items</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{summary.overall.total}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
