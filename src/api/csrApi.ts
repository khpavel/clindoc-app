import { getJson } from "./httpClient";
import type { CsrDocument } from "../types/csr";

export async function getCsrDocument(studyId: number): Promise<CsrDocument> {
  return getJson<CsrDocument>(`/api/v1/csr/${studyId}`);
}

