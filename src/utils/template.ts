import ExcelJS from "exceljs";

import type { ChecklistItem, ChecklistSheet, TemplatePayload } from "@/types/checklist";
import { createSubmissionItemSourceKey } from "@/utils/submissionMapper";

const TEMPLATE_URL = `${import.meta.env.BASE_URL}templates/ward-template.xlsx`;

function asString(value: ExcelJS.CellValue | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object" && "text" in value && typeof value.text === "string") {
    return value.text.trim();
  }

  if (typeof value === "object" && "result" in value) {
    return String(value.result ?? "").trim();
  }

  return "";
}

function getColumnIndexes(headerRow: ExcelJS.Row) {
  let statusColumn = 5;
  let notesColumn = 6;
  let lastColumn = 7;

  headerRow.eachCell((cell, columnNumber) => {
    const title = asString(cell.value).toLowerCase();
    if (title.includes("status")) {
      statusColumn = columnNumber;
    }
    if (title.includes("notes")) {
      notesColumn = columnNumber;
    }
    if (title) {
      lastColumn = Math.max(lastColumn, columnNumber);
    }
  });

  return { statusColumn, notesColumn, lastColumn };
}

function createItem(
  row: ExcelJS.Row,
  sheetName: string,
  sheetLabel: string,
  columnInfo: ReturnType<typeof getColumnIndexes>,
): ChecklistItem | null {
  const id = asString(row.getCell(1).value);
  if (!id) {
    return null;
  }

  return {
    id,
    sourceKey: createSubmissionItemSourceKey(sheetName, id, asString(row.getCell(3).value)),
    sheetName,
    sheetLabel,
    category: asString(row.getCell(2).value),
    element: asString(row.getCell(3).value),
    instruction: asString(row.getCell(4).value),
    targetLocation: asString(row.getCell(7).value) || asString(row.getCell(8).value),
    rowNumber: row.number,
    statusColumn: columnInfo.statusColumn,
    notesColumn: columnInfo.notesColumn,
    lastColumn: columnInfo.lastColumn,
  };
}

function extractSheetLabel(worksheet: ExcelJS.Worksheet) {
  const title = asString(worksheet.getCell("A1").value);
  const pieces = title.split(":");
  if (pieces.length > 1) {
    return pieces.slice(1).join(":").trim();
  }

  return worksheet.name.replace(/checklist/i, "").trim();
}

function parseChecklistSheet(worksheet: ExcelJS.Worksheet): ChecklistSheet {
  const headerRow = worksheet.getRow(5);
  const columnInfo = getColumnIndexes(headerRow);
  const sheetLabel = extractSheetLabel(worksheet);
  const items: ChecklistItem[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber < 6) {
      return;
    }
    const item = createItem(row, worksheet.name, sheetLabel, columnInfo);
    if (item) {
      items.push(item);
    }
  });

  return {
    name: worksheet.name,
    label: sheetLabel,
    items,
    lastColumn: columnInfo.lastColumn,
  };
}

export async function loadTemplateWorkbook(): Promise<TemplatePayload> {
  const response = await fetch(TEMPLATE_URL);

  if (!response.ok) {
    throw new Error("未能載入 Excel template");
  }

  const templateBuffer = await response.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(templateBuffer.slice(0));

  const sheets = workbook.worksheets
    .filter((worksheet) => /checklist/i.test(worksheet.name))
    .map(parseChecklistSheet);

  return {
    templateName: "Hospital_Ward_Pre_Handover_Layman_Checklist-(wilson working).xlsx",
    templateBuffer,
    sheets,
  };
}
