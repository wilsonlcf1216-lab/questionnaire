import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, LoaderCircle, LogOut, RefreshCw, Shield, Table2 } from "lucide-react";

import {
  canAccessAdmin,
  fetchSubmissionDetail,
  fetchSubmissionList,
  getAdminSession,
  signOutAdmin,
} from "@/services/adminService";
import type { SubmissionDetail, SubmissionRecord } from "@/types/checklist";
import { exportSubmissionDetailCsv, exportSubmissionListCsv, exportSubmissionPhotosZip } from "@/utils/adminExport";
import { isSupabaseConfigured } from "@/utils/env";

export default function AdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"supabase" | "demo">("demo");
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [search, setSearch] = useState("");
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isExportingFailZip, setIsExportingFailZip] = useState(false);

  async function refreshSubmissions() {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const session = await getAdminSession();
        if (!canAccessAdmin(session)) {
          navigate("/admin/login");
          return;
        }
      }

      const response = await fetchSubmissionList();
      setMode(response.mode);
      setSubmissions(response.submissions);
      const nextSelectedId = selectedId || response.submissions[0]?.id || "";
      setSelectedId(nextSelectedId);
      if (nextSelectedId) {
        const submissionDetail = await fetchSubmissionDetail(nextSelectedId);
        setDetail(submissionDetail);
      } else {
        setDetail(null);
      }
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "未能讀取後台資料");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelectSubmission(submissionId: string) {
    setSelectedId(submissionId);
    const submissionDetail = await fetchSubmissionDetail(submissionId);
    setDetail(submissionDetail);
  }

  async function handleSignOut() {
    await signOutAdmin();
    navigate("/admin/login");
  }

  async function handleExportZip() {
    if (filteredSubmissions.length === 0) {
      return;
    }

    try {
      setIsExportingZip(true);
      const details = (
        await Promise.all(filteredSubmissions.map((submission) => fetchSubmissionDetail(submission.id)))
      ).filter((submissionDetail): submissionDetail is SubmissionDetail => Boolean(submissionDetail));
      await exportSubmissionPhotosZip(details);
      setError("");
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "未能下載 submission 相片 ZIP");
    } finally {
      setIsExportingZip(false);
    }
  }

  async function handleExportFailZip() {
    if (filteredSubmissions.length === 0) {
      return;
    }

    try {
      setIsExportingFailZip(true);
      const details = (
        await Promise.all(filteredSubmissions.map((submission) => fetchSubmissionDetail(submission.id)))
      ).filter((submissionDetail): submissionDetail is SubmissionDetail => Boolean(submissionDetail));
      await exportSubmissionPhotosZip(details, { failOnly: true });
      setError("");
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "未能下載 Fail item 相片 ZIP");
    } finally {
      setIsExportingFailZip(false);
    }
  }

  const filteredSubmissions = useMemo(
    () =>
      submissions.filter((submission) => {
        const keyword = search.toLowerCase();
        return (
          submission.wardName.toLowerCase().includes(keyword) ||
          submission.inspectorName.toLowerCase().includes(keyword) ||
          submission.id.toLowerCase().includes(keyword)
        );
      }),
    [search, submissions],
  );

  return (
    <div className="min-h-screen bg-[#f3f3ef] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1640px] flex-col gap-6">
        <header className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-white">
                <Shield className="h-3.5 w-3.5" />
                Admin Dashboard
              </div>
              <h1 className="mt-4 font-display text-5xl text-slate-900">集中收數據後台</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {mode === "demo"
                  ? "目前顯示 demo submissions。正式部署後會改為讀 Supabase。"
                  : "你可以喺呢度睇晒所有 submission、逐份檢查 item 同照片，再匯出資料做 consolidation。"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                返回表單
              </Link>
              <button
                type="button"
                onClick={refreshSubmissions}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => exportSubmissionListCsv(filteredSubmissions)}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-teal-900"
              >
                <Download className="h-4 w-4" />
                Export 全部 CSV
              </button>
              <button
                type="button"
                onClick={handleExportZip}
                disabled={isExportingZip || filteredSubmissions.length === 0}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExportingZip ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isExportingZip ? "整理全部相片中..." : "Download 全部 submission 相"}
              </button>
              <button
                type="button"
                onClick={handleExportFailZip}
                disabled={isExportingFailZip || filteredSubmissions.length === 0}
                className="inline-flex items-center gap-2 rounded-full border border-rose-300 bg-rose-50 px-5 py-3 text-sm font-medium text-rose-700 transition hover:border-rose-400 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExportingFailZip ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isExportingFailZip ? "整理 Fail 相片中..." : "只下載 Fail item 相片"}
              </button>
              {isSupabaseConfigured() ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              ) : null}
            </div>
          </div>
        </header>

        {error ? <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Submissions</p>
                <h2 className="font-display text-3xl text-slate-900">{filteredSubmissions.length}</h2>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-600">
                {mode === "demo" ? "Demo Mode" : "Live"}
              </div>
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by ward / inspector / ID"
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
            />

            <div className="mt-4 space-y-3">
              {filteredSubmissions.map((submission) => (
                <button
                  key={submission.id}
                  type="button"
                  onClick={() => handleSelectSubmission(submission.id)}
                  className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                    selectedId === submission.id
                      ? "border-teal-300 bg-teal-50"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{submission.wardName}</p>
                      <p className="mt-1 text-xs text-slate-500">{submission.inspectorName}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">
                      Fail {submission.failCount}
                    </span>
                  </div>
                  <p className="mt-3 truncate text-xs text-slate-400">{submission.id}</p>
                </button>
              ))}

              {!loading && filteredSubmissions.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  未有 matching submissions。
                </div>
              ) : null}
            </div>
          </aside>

          <main className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            {loading ? (
              <div className="flex min-h-[420px] items-center justify-center text-sm text-slate-500">Loading...</div>
            ) : detail ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Submission Detail</p>
                    <h2 className="font-display text-4xl text-slate-900">{detail.wardName}</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      {detail.inspectorName} · {detail.inspectionDate} · {detail.submittedAt}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => exportSubmissionDetailCsv(detail)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-teal-900"
                  >
                    <Table2 className="h-4 w-4" />
                    Export 呢份 CSV
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {[
                    ["Pass", detail.passCount],
                    ["Fail", detail.failCount],
                    ["Unfilled", detail.pendingCount],
                    ["N/A", detail.naCount],
                    ["Total", detail.totalItems],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
                      <p className="mt-2 text-3xl text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                  <strong className="text-slate-900">Remarks:</strong> {detail.remarks || "None"}
                </div>

                <div className="space-y-4">
                  {detail.items.map((item) => (
                    <article key={item.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            {item.sheetName} · {item.itemId}
                          </p>
                          <h3 className="mt-2 text-lg font-medium text-slate-900">{item.element}</h3>
                          <p className="mt-2 text-sm text-slate-500">{item.targetLocation}</p>
                        </div>
                        <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700">
                          {item.status || "Unfilled"}
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
                        <p className="font-medium text-slate-900">Category: {item.category || "Uncategorized"}</p>
                        <p className="mt-2">{item.notes || "No notes"}</p>
                      </div>

                      {item.photos.length > 0 ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {item.photos.map((photo) => (
                            <a
                              key={photo.id}
                              href={photo.photoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="overflow-hidden rounded-[18px] border border-slate-200 bg-white transition hover:shadow-md"
                            >
                              <img src={photo.photoUrl} alt={photo.fileName} className="h-40 w-full object-cover" />
                              <div className="space-y-1 p-3 text-xs text-slate-500">
                                <p>{photo.fileName}</p>
                                <p className="truncate text-[11px] text-slate-400">{photo.storagePath}</p>
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[420px] items-center justify-center text-sm text-slate-500">
                未有 submission 詳情
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
