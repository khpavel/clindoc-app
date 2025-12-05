import { apiUrl } from "../config";
import { getAccessToken } from "../auth/tokenStorage";
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

export async function indexSourceDocument(documentId: number): Promise<void> {
  const token = getAccessToken();
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const endpoint = `/api/v1/sources/${documentId}/index`;
  const res = await fetch(apiUrl(endpoint), {
    method: "POST",
    headers,
    credentials: "include",
  });
  
  if (!res.ok) {
    let errorMessage = `Failed to index source document: ${res.status} ${res.statusText}`;
    
    // Try to extract more details from the response
    try {
      const text = await res.text();
      if (text) {
        try {
          const errorJson = JSON.parse(text);
          if (errorJson.detail) {
            errorMessage = `Failed to index source document: ${errorJson.detail}`;
          } else if (errorJson.message) {
            errorMessage = `Failed to index source document: ${errorJson.message}`;
          } else {
            errorMessage += ` - ${text}`;
          }
        } catch {
          errorMessage += ` - ${text}`;
        }
      }
    } catch {
      // Ignore body read errors
    }
    
    // Provide more context for 404 errors
    if (res.status === 404) {
      errorMessage += `. The endpoint ${endpoint} was not found. Please verify that the backend API endpoint exists.`;
    }
    
    throw new Error(errorMessage);
  }
}

