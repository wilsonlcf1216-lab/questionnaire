import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";

import { sendAdminMagicLink } from "@/services/adminService";
import { isSupabaseConfigured } from "@/utils/env";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await sendAdminMagicLink(email);
      setMessage("Magic link 已寄出，請去 email 開啟登入。");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "未能寄出登入連結");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f3ef] px-4 py-10">
      <div className="w-full max-w-xl rounded-[32px] border border-slate-200/80 bg-white/92 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          返回表單
        </Link>

        <div className="mt-6 inline-flex rounded-full bg-slate-950 p-3 text-white">
          <MailCheck className="h-5 w-5" />
        </div>
        <h1 className="mt-5 font-display text-5xl text-slate-900">Admin Login</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          後台使用 email magic link 登入。你收到 email 後，按入去就會自動進入 `/admin`。
        </p>

        {!isSupabaseConfigured() ? (
          <div className="mt-6 rounded-[20px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            目前未設定 Supabase，呢頁只作佈局示範。正式使用前要先填 `VITE_SUPABASE_URL` 及
            `VITE_SUPABASE_ANON_KEY`。
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.22em] text-slate-500">Admin Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
            />
          </label>
          <button
            type="submit"
            disabled={submitting || !isSupabaseConfigured()}
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        {message ? <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {error ? <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </div>
    </div>
  );
}
