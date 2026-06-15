import ExcelJS from "exceljs";

import type {
  ChecklistSheet,
  InspectionItemResult,
  InspectionMeta,
  InspectionPhoto,
} from "@/types/checklist";
import { buildInspectionSummary } from "@/utils/checklistStats";

function setMetaBlock(worksheet: ExcelJS.Worksheet, meta: InspectionMeta) {
  const labels = [
    ["I1", "Ward"],
    ["I2", "Inspector"],
    ["I3", "Inspection Date"],
    ["I4", "Handover Batch"],
    ["I5", "Remarks"],
    ["J1", meta.wardName],
    ["J2", meta.inspectorName],
    ["J3", meta.inspectionDate],
    ["J4", meta.handoverBatch],
    ["J5", meta.remarks],
  ] as const;

  for (const [address, value] of labels) {
    worksheet.getCell(address).value = value;
  }
}

function writeSummaryDashboard(
  worksheet: ExcelJS.Worksheet | undefined,
  sheets: ChecklistSheet[],
  results: Record<string, InspectionItemResult>,
  meta: InspectionMeta,
) {
  if (!worksheet) {
    return;
  }

  const summary = buildInspectionSummary(sheets, results);
  setMetaBlock(worksheet, meta);

  const zoneRows: number[] = [];
  let totalRow = -1;

  for (let rowNumber = 7; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const label = String(worksheet.getCell(`A${rowNumber}`).value ?? "").trim().toLowerCase();
    if (!label) {
      continue;
    }

    if (label.includes("total ward summary")) {
      totalRow = rowNumber;
      break;
    }

    zoneRows.push(rowNumber);
  }

  sheets.forEach((sheet, index) => {
    const rowNumber = zoneRows[index];
    if (!rowNumber) {
      return;
    }

    const stats = summary.bySheet[sheet.name];
    worksheet.getCell(`B${rowNumber}`).value = stats.total;
    worksheet.getCell(`C${rowNumber}`).value = stats.pass;
    worksheet.getCell(`D${rowNumber}`).value = stats.fail;
    worksheet.getCell(`E${rowNumber}`).value = stats.pending;
    worksheet.getCell(`F${rowNumber}`).value = stats.na;
    worksheet.getCell(`G${rowNumber}`).value = stats.completionRate / 100;
    worksheet.getCell(`G${rowNumber}`).numFmt = "0%";
  });

  if (totalRow > 0) {
    worksheet.getCell(`B${totalRow}`).value = summary.overall.total;
    worksheet.getCell(`C${totalRow}`).value = summary.overall.pass;
    worksheet.getCell(`D${totalRow}`).value = summary.overall.fail;
    worksheet.getCell(`E${totalRow}`).value = summary.overall.pending;
    worksheet.getCell(`F${totalRow}`).value = summary.overall.na;
    worksheet.getCell(`G${totalRow}`).value = summary.overall.completionRate / 100;
    worksheet.getCell(`G${totalRow}`).numFmt = "0%";
  }

  worksheet.getCell("A12").value = summary.overall.pass;
  worksheet.getCell("D12").value = summary.overall.fail;
}

function getImageExtension(photo: InspectionPhoto): "png" | "jpeg" {
  return photo.mimeType === "image/png" ? "png" : "jpeg";
}

function ensurePhotoColumns(worksheet: ExcelJS.Worksheet, startColumn: number, maxPhotos: number) {
  worksheet.getCell(5, startColumn).value = "Photo Count";
  worksheet.getColumn(startColumn).width = 14;

  for (let index = 0; index < maxPhotos; index += 1) {
    const columnNumber = startColumn + index + 1;
    worksheet.getCell(5, columnNumber).value = `Photo ${index + 1}`;
    worksheet.getColumn(columnNumber).width = 24;
  }
}

function embedSheetPhotos(
  workbook: ExcelJS.Workbook,
  worksheet: ExcelJS.Worksheet,
  sheet: ChecklistSheet,
  results: Record<string, InspectionItemResult>,
) {
  const itemsWithPhotos = sheet.items.filter((item) => (results[item.sourceKey]?.photos.length ?? 0) > 0);

  if (itemsWithPhotos.length === 0) {
    return;
  }

  const maxPhotos = Math.max(...itemsWithPhotos.map((item) => results[item.sourceKey]?.photos.length ?? 0));
  const startColumn = sheet.lastColumn + 1;
  ensurePhotoColumns(worksheet, startColumn, maxPhotos);

  for (const item of sheet.items) {
    const result = results[item.sourceKey];
    const photos = result?.photos ?? [];
    worksheet.getCell(item.rowNumber, item.statusColumn).value = result?.status || "";
    worksheet.getCell(item.rowNumber, item.notesColumn).value = result?.notes || "";

    if (photos.length === 0) {
      continue;
    }

    worksheet.getCell(item.rowNumber, startColumn).value = photos.length;
    worksheet.getRow(item.rowNumber).height = 86;

    photos.forEach((photo, photoIndex) => {
      const imageId = workbook.addImage({
        base64: photo.dataUrl,
        extension: getImageExtension(photo),
      });

      const columnNumber = startColumn + photoIndex + 1;
      workbook.getWorksheet(worksheet.id)?.addImage(imageId, {
        tl: { col: columnNumber - 1, row: item.rowNumber - 1 + 0.08 },
        ext: { width: 140, height: 92 },
        editAs: "oneCell",
      });
    });
  }
}

export async function exportInspectionWorkbook(params: {
  templateBuffer: ArrayBuffer;
  sheets: ChecklistSheet[];
  results: Record<string, InspectionItemResult>;
  meta: InspectionMeta;
}) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(params.templateBuffer.slice(0));

  writeSummaryDashboard(
    workbook.getWorksheet("Summary Dashboard"),
    params.sheets,
    params.results,
    params.meta,
  );

  for (const sheet of params.sheets) {
    const worksheet = workbook.getWorksheet(sheet.name);
    if (!worksheet) {
      continue;
    }

    embedSheetPhotos(workbook, worksheet, sheet, params.results);
  }

  const output = await workbook.xlsx.writeBuffer();
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
