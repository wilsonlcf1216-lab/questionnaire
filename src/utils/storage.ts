import type { InspectionDraft } from "@/types/checklist";

const DATABASE_NAME = "ward-checklist-drafts";
const STORE_NAME = "drafts";
const DRAFT_KEY = "latest";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("未能開啟本地草稿資料庫"));
  });
}

export async function saveDraftToStorage(draft: InspectionDraft): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(draft, DRAFT_KEY);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(new Error("儲存草稿失敗"));
    };
  });
}

export async function loadDraftFromStorage(): Promise<InspectionDraft | null> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(DRAFT_KEY);
    request.onsuccess = () => {
      database.close();
      resolve((request.result as InspectionDraft | undefined) ?? null);
    };
    request.onerror = () => {
      database.close();
      reject(new Error("讀取草稿失敗"));
    };
  });
}

export async function clearDraftFromStorage(): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(DRAFT_KEY);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(new Error("刪除草稿失敗"));
    };
  });
}
