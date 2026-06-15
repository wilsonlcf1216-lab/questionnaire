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
    <header className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="absolute inset-y-0 right-0 w-72 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.16),_transparent_62%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-teal-950 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-teal-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            Hospital Ward Pre-Handover
          </div>
          <div className="space-y-3">
            <h1 className="font-display text-4xl text-slate-900 sm:text-5xl">
              現場 checklist 可以即填、即影、即匯出 Excel
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              按返你現有 template 做資料結構，現場逐個 item 記錄 status、defect notes 同照片，
              最後直接下載返帶圖片 Excel，方便你 consolidate。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              Template: {templateName}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
              {saveMessage || "未儲存最新更改"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
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
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className={`h-4 w-4 ${isSubmitting ? "animate-pulse" : ""}`} />
            {isSubmitting ? "提交中..." : "Submit 到後台"}
          </button>
        </div>
      </div>
    </header>
  );
}
