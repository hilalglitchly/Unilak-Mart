import imageCompression from "browser-image-compression";

export interface CompressedListingImage {
  url: string;
  file: File;
  originalKb: number;
  compressedKb: number;
  name: string;
}

/** Mengompres gambar listing di browser sebelum pratinjau atau unggah Storage. */
export async function compressListingImages(
  files: File[],
  maxCount: number
): Promise<CompressedListingImage[]> {
  const batch = files.slice(0, Math.max(0, maxCount));
  const processed: CompressedListingImage[] = [];

  for (const file of batch) {
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.25,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    });
    const url = await imageCompression.getDataUrlFromFile(compressed);
    processed.push({
      url,
      file: compressed,
      originalKb: Math.max(1, Math.round(file.size / 1024)),
      compressedKb: Math.max(1, Math.round(compressed.size / 1024)),
      name: file.name,
    });
  }

  return processed;
}
