import { Link, useLocation } from "react-router-dom";
import { Download, FileSpreadsheet, House } from "lucide-react";

import type { InspectionSummary } from "@/types/checklist";

interface LocationState {
  fileName?: string;
  wardName?: string;
  summary?: InspectionSummary;
}

export default function ExportSummary() {
  const location = useLocation();
  const state = (location.state as LocationState | undefined) ?? {};
  const summary = state.summary;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f3ef] px-4 py-10">
      <div className="w-full max-w-3xl rounded-[32px] border border-slate-200/80 bg-white/92 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <div className="inline-flex rounded-full bg-emerald-100 p-3 text-emerald-700">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-5xl text-slate-900">Excel 已匯出</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          {state.wardName
            ? `${state.wardName} 嘅檢查結果已經下載。`
            : "檢查結果已經下載到你部機。"}
          你可以繼續回到表單更新資料，再重新匯出新版本。
        </p>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Downloaded File</p>
          <p className="mt-2 break-all text-sm font-medium text-slate-900">{state.fileName ?? "已下載 Excel 檔案"}</p>
        </div>

        {summary ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Passed</p>
              <p className="mt-2 text-3xl text-emerald-700">{summary.overall.pass}</p>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Failed</p>
              <p className="mt-2 text-3xl text-rose-700">{summary.overall.fail}</p>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">N/A</p>
              <p className="mt-2 text-3xl text-slate-700">{summary.overall.na}</p>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Unfilled</p>
              <p className="mt-2 text-3xl text-amber-700">{summary.overall.unfilled}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-teal-900"
          >
            <House className="h-4 w-4" />
            返回 checklist
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            繼續更新再匯出
          </Link>
        </div>
      </div>
    </div>
  );
}
