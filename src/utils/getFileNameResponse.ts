import { formatDate } from "date-fns";
import type { FetchResponse } from "ofetch";

export const typeFileDocument = {
  xls: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  xlsx: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  ods: ["application/vnd.oasis.opendocument.spreadsheet"],
  csv: ["text/csv"],
  txt: ["text/plain"],
  doc: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  rtf: ["application/rtf"],
  odt: ["application/vnd.oasis.opendocument.text"],
  pdf: ["application/pdf"],
  ppt: [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  odp: ["application/vnd.oasis.opendocument.presentation"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  gif: ["image/gif"],
  bmp: ["image/bmp"],
  svg: ["image/svg+xml"],
  webp: ["image/webp"],
};

/**
 * Get filename from fetch response
 * @param response - Fetch response
 * @param defaultName - Default file name if content-disposition not available
 * @returns string
 */
export function getFilenameFromResponse(response: FetchResponse<any>, defaultName?: string) {
  const fileName = response.headers.get("content-disposition")?.split("filename=")[1];
  if (fileName) {
    return fileName;
  }

  if (typeof defaultName === "string" && defaultName.trim() !== "") {
    return defaultName;
  }

  const contentType = response.headers.get("content-type")!;
  const ext         = Object.entries(typeFileDocument).find(([_, values]) => values.includes(contentType))?.[0] ??
    "txt";
  const pageTitle   = document.title;
  const name        = pageTitle
    .substring(0, pageTitle.indexOf("|") - 1)
    .replace(/\s/g, "-")
    .toLowerCase();
  const result      = `${name}-${formatDate(new Date(), "DD-MM-YYYY-HH-mm-ss")}.${ext}`;

  return result;
}
