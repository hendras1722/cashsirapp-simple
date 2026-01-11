const mimes: Record<string, string> = {
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  json: "application/json",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  png: "image/png",
  pdf: "application/pdf",
  svg: "image/svg+xml",
  txt: "text/plain",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

/**
 * Download file via anchor
 * @param raw - Base64/url of file
 * @param filename - File name
 * @param mimeType - Mime type
 */
export function downloadFile(raw: string | File, filename: string, mimeType?: string) {
  const ext          = filename?.split(".").pop();
  const hasExtension = Object.keys(mimes).includes(ext ?? "") || typeof mimeType === "string";
  if (!hasExtension) {
    throw new Error("Failed to download file");
  }

  const mime = mimeType ?? mimes?.[ext as string];
  const blob = typeof raw === "string" ? new Blob([raw], { type: `${mime};charset=utf-8;` }) : raw;
  if ((window.navigator as any).msSaveBlob) {
    (window.navigator as any).msSaveBlob(blob, filename);
    return;
  }

  const link = document.createElement("a");
  if (link.download !== undefined) {
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", filename);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
