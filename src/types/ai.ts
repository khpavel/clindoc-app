// These types mirror the backend AI schemas

export interface GenerateSectionTextRequest {
  study_id: number;
  section_id: number;
  prompt?: string | null;
  max_tokens?: number | null;
  temperature?: number | null;
}

export interface GenerateSectionTextResponse {
  study_id: number;
  section_id: number;
  generated_text: string;
  model_name?: string | null;
  created_at: string;
}

