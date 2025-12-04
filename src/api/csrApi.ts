import { getJson, postJson } from "./httpClient";
import type { CsrDocument, CsrSectionVersion } from "../types/csr";

export async function getCsrDocument(studyId: number): Promise<CsrDocument> {
  return getJson<CsrDocument>(`/api/v1/csr/${studyId}`);
}

export async function getLatestSectionVersion(
  sectionId: number
): Promise<CsrSectionVersion> {
  return getJson<CsrSectionVersion>(`/api/v1/csr/sections/${sectionId}/versions/latest`);
}

export interface SaveSectionVersionPayload {
  text: string;
  created_by?: string | null;
}

export async function saveSectionVersion(
  sectionId: number,
  payload: SaveSectionVersionPayload
): Promise<CsrSectionVersion> {
  return postJson<SaveSectionVersionPayload, CsrSectionVersion>(
    `/api/v1/csr/sections/${sectionId}/versions`,
    payload
  );
}

