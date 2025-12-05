import { postJson } from "./httpClient";
import type {
  GenerateSectionTextRequest,
  GenerateSectionTextResponse,
} from "../types/ai";

export async function generateSectionText(
  body: GenerateSectionTextRequest
): Promise<GenerateSectionTextResponse> {
  return postJson<GenerateSectionTextRequest, GenerateSectionTextResponse>(
    "/api/v1/ai/generate-section-text",
    body
  );
}
