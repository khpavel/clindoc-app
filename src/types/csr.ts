// These types mirror the backend CsrSectionRead and CsrDocumentRead

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

