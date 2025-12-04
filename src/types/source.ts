// These types mirror the backend SourceDocumentRead schema

export type SourceDocumentType = "protocol" | "sap" | "tlf" | "csr_prev";

export interface SourceDocument {
  id: number;
  study_id: number;
  type: SourceDocumentType | string;
  file_name: string;
  uploaded_at: string;
  uploaded_by?: string | null;
}

