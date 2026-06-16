import { describe, expect, it } from "vitest";

import type { ChecklistSheet, InspectionItemResult } from "@/types/checklist";
import { buildInspectionSummary } from "@/utils/checklistStats";

const sheets: ChecklistSheet[] = [
  {
    name: "Ward Office Checklist",
    label: "Ward Office",
    lastColumn: 7,
    items: [
      {
        id: "OFF-01",
        sourceKey: "Ward Office Checklist::OFF-01::Ceiling Panels",
        sheetName: "Ward Office Checklist",
        sheetLabel: "Ward Office",
        category: "Finishes",
        element: "Ceiling Panels",
        instruction: "",
        targetLocation: "",
        rowNumber: 6,
        statusColumn: 5,
        notesColumn: 6,
        lastColumn: 7,
      },
      {
        id: "OFF-02",
        sourceKey: "Ward Office Checklist::OFF-02::Wall Paint",
        sheetName: "Ward Office Checklist",
        sheetLabel: "Ward Office",
        category: "Finishes",
        element: "Wall Paint",
        instruction: "",
        targetLocation: "",
        rowNumber: 7,
        statusColumn: 5,
        notesColumn: 6,
        lastColumn: 7,
      },
    ],
  },
];

describe("buildInspectionSummary", () => {
  it("calculates pass, fail and completion values", () => {
    const results: Record<string, InspectionItemResult> = {
      "OFF-01": {
        itemId: "OFF-01",
        sourceKey: "Ward Office Checklist::OFF-01::Ceiling Panels",
        status: "Pass",
        notes: "",
        photos: [],
        updatedAt: "",
      },
      "OFF-02": {
        itemId: "OFF-02",
        sourceKey: "Ward Office Checklist::OFF-02::Wall Paint",
        status: "Fail",
        notes: "paint chip",
        photos: [],
        updatedAt: "",
      },
    };

    const summary = buildInspectionSummary(sheets, {
      "Ward Office Checklist::OFF-01::Ceiling Panels": results["OFF-01"],
      "Ward Office Checklist::OFF-02::Wall Paint": results["OFF-02"],
    });

    expect(summary.overall.total).toBe(2);
    expect(summary.overall.completed).toBe(2);
    expect(summary.overall.pass).toBe(1);
    expect(summary.overall.fail).toBe(1);
    expect(summary.overall.completionRate).toBe(100);
  });

  it("treats blank statuses as unfilled work", () => {
    const summary = buildInspectionSummary(sheets, {});

    expect(summary.overall.total).toBe(2);
    expect(summary.overall.completed).toBe(0);
    expect(summary.overall.unfilled).toBe(2);
    expect(summary.overall.completionRate).toBe(0);
  });
});
