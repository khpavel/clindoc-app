import { apiUrl } from "../config";
import type { SourceDocument, SourceDocumentType } from "../types/source";

export async function listSourceDocuments(studyId: number): Promise<SourceDocument[]> {
  const res = await fetch(apiUrl(`/api/v1/sources/${studyId}`), {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to load source documents: ${res.status}`);
  }
  return res.json();
}

export async function uploadSourceDocument(
  studyId: number,
  file: File,
  type: SourceDocumentType
): Promise<SourceDocument> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const res = await fetch(apiUrl(`/api/v1/sources/${studyId}/upload`), {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to upload source document: ${res.status}`);
  }
  return res.json();
}

