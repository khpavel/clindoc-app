import { postJson } from "./httpClient";

export interface GenerateSectionTextRequest {
  section_id: number;
  prompt: string;
}

export interface GenerateSectionTextResponse {
  section_id: number;
  generated_text: string;
  model?: string;
}

export async function generateSectionText(
  payload: GenerateSectionTextRequest
): Promise<GenerateSectionTextResponse> {
  return postJson<GenerateSectionTextRequest, GenerateSectionTextResponse>(
    "/api/v1/ai/generate-section-text",
    payload
  );
}

