import type { InspectionPhoto } from "@/types/checklist";
import { generateId } from "@/utils/id";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.86;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`未能讀取圖片：${file.name}`));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("未能載入圖片"));
    image.src = source;
  });
}

async function resizeDataUrl(dataUrl: string, mimeType: string) {
  const image = await loadImage(dataUrl);
  const scale = Math.min(MAX_DIMENSION / image.width, MAX_DIMENSION / image.height, 1);
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    return { dataUrl, width: image.width, height: image.height };
  }

  context.drawImage(image, 0, 0, width, height);

  const outputType = mimeType === "image/png" ? "image/png" : "image/jpeg";
  const output = canvas.toDataURL(outputType, JPEG_QUALITY);

  return { dataUrl: output, width, height };
}

export async function preparePhoto(file: File): Promise<InspectionPhoto> {
  const original = await readAsDataUrl(file);
  const resized = await resizeDataUrl(original, file.type);

  return {
    id: generateId(),
    name: file.name,
    mimeType: resized.dataUrl.startsWith("data:image/png") ? "image/png" : "image/jpeg",
    dataUrl: resized.dataUrl,
    width: resized.width,
    height: resized.height,
    createdAt: new Date().toISOString(),
  };
}
