import { getJson, postJson } from "./httpClient";
import type { Study } from "../types/study";

export async function listStudies(): Promise<Study[]> {
  return getJson<Study[]>("/studies");
}

export async function getStudy(studyId: number): Promise<Study> {
  return getJson<Study>(`/studies/${studyId}`);
}

export interface CreateStudyPayload {
  code: string;
  title: string;
  phase?: string | null;
}

export async function createStudy(
  payload: CreateStudyPayload
): Promise<Study> {
  return postJson<CreateStudyPayload, Study>("/studies", payload);
}


