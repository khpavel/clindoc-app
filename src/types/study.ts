/**
 * Study type definition.
 * This mirrors the backend StudyRead schema.
 */
export interface Study {
  id: number;
  code: string;
  title: string;
  phase: string | null;
}

