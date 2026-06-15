import { describe, expect, it, vi } from "vitest";

import { createExportFilename } from "@/utils/file";

describe("createExportFilename", () => {
  it("builds a sanitized xlsx filename", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T10:30:00.000Z"));

    const filename = createExportFilename("Ward 7A / North", "2026-06-15");

    expect(filename).toMatch(/^ward-7a-north-2026-06-15-2026-06-15T10-30-00-000Z\.xlsx$/);
    vi.useRealTimers();
  });
});
