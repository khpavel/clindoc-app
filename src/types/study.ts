/**
 * Study type definition.
 * This mirrors the backend StudyRead schema.
 */
export interface Study {
  id: number;
  code: string;
  title: string;
  phase: string | null;
  status?: "draft" | "ongoing" | "closed" | "archived";
  indication?: string;
  sponsorName?: string;
}

/**
 * Study member role types.
 */
export type StudyMemberRole = "owner" | "editor" | "viewer";

/**
 * Study member type definition.
 * This mirrors the backend StudyMember schema.
 */
export interface StudyMember {
  id: number;
  studyId: number;
  userId: number;
  userEmail?: string;
  userName?: string;
  role: StudyMemberRole;
  createdAt: string;
}

