import { Link } from "react-router-dom";
import { Send, Save, ShieldCheck } from "lucide-react";

interface AppHeaderProps {
  templateName: string;
  saveMessage: string;
  onSave: () => void;
  onSubmit: () => void;
  isSaving: boolean;
  isSubmitting: boolean;
}

export function AppHeader({
  templateName,
  saveMessage,
  onSave,
  onSubmit,
  isSaving,
  isSubmitting,
}: AppHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-[linear-gradient(135deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98)_38%,rgba(236,253,245,0.9))] p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7">
      <div className="absolute inset-y-0 right-0 w-80 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.2),_transparent_62%)]" />
      <div className="absolute -left-14 top-0 h-40 w-40 rounded-full bg-teal-100/60 blur-3xl" />
      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-4xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-slate-950 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-teal-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            Hospital Ward Pre-Handover
          </div>
          <div className="space-y-4">
            <h1 className="max-w-4xl font-display text-4xl leading-tight text-slate-950 sm:text-5xl xl:text-6xl">
              現場 checklist 可以即填、即影、即匯出 Excel
            </h1>
            <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] border border-white/70 bg-white/80 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Workflow</p>
                <p className="mt-1 text-sm font-medium text-slate-900">即填、即影、即提交</p>
              </div>
              <div className="rounded-[22px] border border-white/70 bg-white/80 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Status</p>
                <p className="mt-1 text-sm font-medium text-slate-900">PASS / FAIL / N/A</p>
              </div>
              <div className="rounded-[22px] border border-white/70 bg-white/80 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Focus</p>
                <p className="mt-1 text-sm font-medium text-slate-900">重要 instruction 優先顯示</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
              Template: {templateName}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
              {saveMessage || "未儲存最新更改"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 xl:justify-end">
          <Link
            to="/admin"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Admin 後台
          </Link>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "儲存中..." : "Save 草稿"}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-[0_20px_40px_rgba(15,23,42,0.16)] transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className={`h-4 w-4 ${isSubmitting ? "animate-pulse" : ""}`} />
            {isSubmitting ? "提交中..." : "Submit 到後台"}
          </button>
        </div>
      </div>
    </header>
  );
}
