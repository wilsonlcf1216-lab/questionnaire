export function createExportFilename(wardName: string, inspectionDate: string): string {
  const safeWard = (wardName || "ward")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const safeDate = inspectionDate || new Date().toISOString().slice(0, 10);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  return `${safeWard || "ward"}-${safeDate}-${timestamp}.xlsx`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
