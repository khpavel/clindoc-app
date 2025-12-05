import { getJson } from "./httpClient";
import type { RagStudyChunksResponse } from "../types/rag";

export async function getRagChunksForStudy(
  studyId: number,
  options?: { sourceType?: string; limit?: number; offset?: number }
): Promise<RagStudyChunksResponse> {
  const params = new URLSearchParams();
  if (options?.sourceType) params.append("source_type", options.sourceType);
  if (options?.limit != null) params.append("limit", String(options.limit));
  if (options?.offset != null) params.append("offset", String(options.offset));

  const query = params.toString();
  const path = query
    ? `/api/v1/rag/${encodeURIComponent(String(studyId))}?${query}`
    : `/api/v1/rag/${encodeURIComponent(String(studyId))}`;

  return getJson<RagStudyChunksResponse>(path);
}

