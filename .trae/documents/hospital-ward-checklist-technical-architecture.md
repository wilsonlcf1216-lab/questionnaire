## 1. 架構設計
```mermaid
flowchart LR
    A["React 前端介面"] --> B["表單狀態管理"]
    B --> C["瀏覽器本地草稿儲存"]
    B --> D["Excel Template 解析層"]
    B --> E["圖片處理模組"]
    D --> F["Excel 匯出引擎"]
    E --> F
    F --> G["下載帶圖片 Excel 檔案"]
```

## 2. 技術說明
- 前端：React 18 + TypeScript + Vite
- UI：Tailwind CSS 3 + 自訂 component 樣式
- Excel 處理：`exceljs` 負責讀寫 workbook、更新工作表內容、嵌入圖片
- 檔案處理：瀏覽器 `File API` + `Blob` + `URL.createObjectURL`
- 狀態管理：React Context + reducer，或者輕量 `zustand`
- 草稿儲存：`localStorage` 保存表單 JSON；圖片以壓縮後 data URL 或 IndexedDB 儲存
- 初始化工具：Vite
- 後端：None，首版採用純前端本地處理，避免部署複雜度

## 3. 路由定義
| 路由 | 用途 |
|-------|---------|
| `/` | 主工作台，包含基本資料、區域導覽、檢查項目列表 |
| `/export` | 匯出摘要與下載結果頁 |

## 4. 核心資料結構
### 4.1 TypeScript 資料模型
```ts
type ChecklistStatus = 'Pass' | 'Fail' | 'Pending' | 'N/A';

interface ChecklistTemplateItem {
  id: string;
  sheetName: string;
  category: string;
  element: string;
  instruction: string;
  targetLocation: string;
  rowNumber: number;
}

interface InspectionPhoto {
  id: string;
  name: string;
  mimeType: string;
  dataUrl: string;
  width: number;
  height: number;
  createdAt: string;
}

interface InspectionItemResult {
  itemId: string;
  status: ChecklistStatus | '';
  notes: string;
  photos: InspectionPhoto[];
  updatedAt: string;
}

interface InspectionMeta {
  wardName: string;
  inspectorName: string;
  inspectionDate: string;
  handoverBatch: string;
  remarks: string;
}

interface InspectionDraft {
  templateName: string;
  meta: InspectionMeta;
  results: Record<string, InspectionItemResult>;
}
```

### 4.2 匯出策略
- 以原始 Excel template 作為 base workbook，保留原本 sheet 名稱、summary 公式或布局。
- 將每個 item 嘅 `status` 寫回原本 Status 欄，`notes` 寫回 Notes / Defect Details 欄。
- 如需要新增 metadata，可於 workbook 開頭或指定 summary 區域加入 inspection date、inspector、ward name。
- 圖片會嵌入對應 checklist sheet 右側新欄位或額外 `Photo Evidence` 區塊，並同 item row 對齊。
- 若單一 item 有多張相，可垂直堆疊或建立多格 image anchor，避免覆蓋原欄位內容。

## 5. 模組拆分
| 模組 | 職責 |
|------|------|
| `template-parser` | 讀取內建 checklist template，轉成前端可渲染嘅 sheet / item 結構 |
| `inspection-store` | 管理 metadata、item result、進度統計、草稿保存 |
| `photo-manager` | 處理相片上載、壓縮、縮圖、刪除、手機相機輸入 |
| `excel-exporter` | 使用 `exceljs` 生成輸出 workbook，寫入資料與圖片 |
| `dashboard-ui` | 呈現摘要、篩選器、區域切換、狀態 badge |
| `checklist-item-card` | 呈現單一 item 表單、圖片區、驗證訊息 |

## 6. 介面與驗證規則
- `Save`：保存到瀏覽器本地草稿，不即時下載檔案。
- `Export Excel`：先驗證必填 metadata，再生成 `.xlsx`。
- 狀態欄必須只接受 `Pass / Fail / Pending / N/A`。
- 圖片接受 `jpg`、`jpeg`、`png`、`webp`；匯出前會轉成 `png` 或保持原格式視乎 `exceljs` 支援。
- 單張圖片需要做尺寸壓縮，避免導致 Excel 檔案過大。

## 7. 風險與處理
- 圖片過多導致 Excel 體積過大：加入圖片壓縮、限制單張大小、提示使用者。
- 瀏覽器 localStorage 容量不足：相片資料優先用 IndexedDB，本地只儲 metadata 與索引。
- 原 Excel 某些格式或 merged cells 較複雜：匯出時盡量保持 template 原樣，只針對資料欄位與新增圖片區做最小修改。
- 手機拍照權限受瀏覽器限制：提供檔案上載 fallback，避免功能完全依賴 camera API。
