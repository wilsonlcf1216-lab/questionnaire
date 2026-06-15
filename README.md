# Hospital Ward Checklist

集中式 hospital ward pre-handover checklist web app。

## 本地開發

```bash
npm install
npm run dev
```

## 環境變數

複製 `.env.example` 成 `.env`，再填：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAILS`
- `VITE_BASE_PATH`

## Supabase 設定

1. 開一個新 Supabase project
2. 去 SQL Editor 執行 `supabase/schema.sql`
3. 去 Authentication 開啟 Email OTP / Magic Link
4. 去 GitHub repo secrets 加入：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAILS`

## GitHub Pages

1. Push 到 `main`
2. 去 repo `Settings -> Pages`
3. Source 選 `GitHub Actions`
4. workflow `Deploy To GitHub Pages` 會自動 build 同 deploy

## 路由

- `/` 公開填表頁
- `/submitted` 提交成功頁
- `/admin/login` admin magic link 登入
- `/admin` 管理後台
