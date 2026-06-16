import type {
  ChecklistSheet,
  InspectionItemResult,
  InspectionSummary,
  SheetStats,
} from "@/types/checklist";

const createEmptyStats = (): SheetStats => ({
  total: 0,
  completed: 0,
  unfilled: 0,
  pass: 0,
  fail: 0,
  na: 0,
  completionRate: 0,
});

const finalizeStats = (stats: SheetStats): SheetStats => ({
  ...stats,
  completionRate: stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100),
});

export function buildInspectionSummary(
  sheets: ChecklistSheet[],
  results: Record<string, InspectionItemResult>,
): InspectionSummary {
  const overall = createEmptyStats();
  const bySheet: Record<string, SheetStats> = {};

  for (const sheet of sheets) {
    const sheetStats = createEmptyStats();

    for (const item of sheet.items) {
      const result = results[item.sourceKey];
      sheetStats.total += 1;
      overall.total += 1;

      if (!result?.status) {
        sheetStats.unfilled += 1;
        overall.unfilled += 1;
        continue;
      }

      sheetStats.completed += 1;
      overall.completed += 1;

      if (result.status === "Pass") {
        sheetStats.pass += 1;
        overall.pass += 1;
      } else if (result.status === "Fail") {
        sheetStats.fail += 1;
        overall.fail += 1;
      } else if (result.status === "N/A") {
        sheetStats.na += 1;
        overall.na += 1;
      }
    }

    bySheet[sheet.name] = finalizeStats(sheetStats);
  }

  return {
    overall: finalizeStats(overall),
    bySheet,
  };
}
