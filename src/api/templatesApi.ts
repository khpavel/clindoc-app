import { getJson, postJson } from "./httpClient";
import type { Template, TemplateRenderResponse } from "../types/template";

export async function listSectionTemplates(
  sectionCode: string,
  options?: { language?: string; scope?: string }
): Promise<Template[]> {
  const params = new URLSearchParams();
  if (options?.language) params.append("language", options.language);
  if (options?.scope) params.append("scope", options.scope);
  const query = params.toString();
  const path = query
    ? `/api/v1/templates/section/${encodeURIComponent(sectionCode)}?${query}`
    : `/api/v1/templates/section/${encodeURIComponent(sectionCode)}`;
  return getJson<Template[]>(path);
}

export interface TemplateRenderRequest {
  study_id: number;
  section_id?: number | null;
  extra_context?: Record<string, unknown>;
}

export async function renderTemplate(
  templateId: number,
  body: TemplateRenderRequest
): Promise<TemplateRenderResponse> {
  return postJson<TemplateRenderRequest, TemplateRenderResponse>(
    `/api/v1/templates/${templateId}/render`,
    body
  );
}

