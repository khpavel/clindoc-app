export type TemplateType = "section_text" | "prompt";

export type TemplateScope = "global" | "sponsor" | "study";

export interface Template {
  id: number;
  name: string;
  description?: string | null;
  type: TemplateType;
  section_code?: string | null;
  language: string;
  scope: TemplateScope | string;
  content: string;
  is_default: boolean;
  is_active: boolean;
  version: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
}

export interface TemplateRenderResponse {
  rendered_text: string;
  used_variables?: Record<string, string | null>;
  missing_variables?: string[];
}

