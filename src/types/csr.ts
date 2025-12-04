// These types mirror backend CSR schemas

export interface CsrSection {
  id: number;
  code: string;
  title: string;
  order_index: number;
}

export interface CsrDocument {
  id: number;
  study_id: number;
  title: string;
  status: string;
  sections: CsrSection[];
}

export interface CsrSectionVersion {
  id: number;
  text: string;
  created_at: string;
  created_by?: string | null;
  source?: string | null;
}

