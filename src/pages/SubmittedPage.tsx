import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Database, House } from "lucide-react";

import type { SubmissionRecord } from "@/types/checklist";

interface LocationState {
  submission?: SubmissionRecord;
  mode?: "supabase" | "demo";
}

export default function SubmittedPage() {
  const state = ((useLocation().state as LocationState | undefined) ?? {}) as LocationState;
  const submission = state.submission;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f3ef] px-4 py-10">
      <div className="w-full max-w-3xl rounded-[32px] border border-slate-200/80 bg-white/92 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <div className="inline-flex rounded-full bg-emerald-100 p-3 text-emerald-700">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-5xl text-slate-900">Submission 已提交</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          使用者唔需要下載檔案，資料已集中送去你嘅收集系統。
        </p>

        {submission ? (
          <div className="mt-6 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Submission ID</p>
              <p className="mt-2 break-all text-sm font-medium text-slate-900">{submission.id}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Ward</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{submission.wardName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Inspector</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{submission.inspectorName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Summary</p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                Pass {submission.passCount} / Fail {submission.failCount} / N/A {submission.naCount} / Unfilled{" "}
                {submission.pendingCount}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-teal-900"
          >
            <House className="h-4 w-4" />
            開新 submission
          </Link>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Database className="h-4 w-4" />
            去 admin 後台
          </Link>
        </div>
      </div>
    </div>
  );
}
