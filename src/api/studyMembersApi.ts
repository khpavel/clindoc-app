import { getJson, postJson, deleteJson } from "./httpClient";
import type { StudyMember, StudyMemberRole } from "../types/study";

/**
 * Backend API response format for study member.
 */
interface StudyMemberApiResponse {
  id: number;
  study_id: number;
  user_id: number;
  role: StudyMemberRole;
  created_at: string;
  user: {
    id: number;
    username: string;
    full_name: string | null;
    email: string | null;
  };
}

/**
 * Transform API response to frontend format.
 */
function transformStudyMember(apiMember: StudyMemberApiResponse): StudyMember {
  // Handle full_name: use it if it's not null and not empty, otherwise fall back to username
  const userName = apiMember.user.full_name?.trim() || apiMember.user.username || undefined;
  
  return {
    id: apiMember.id,
    studyId: apiMember.study_id,
    userId: apiMember.user_id,
    role: apiMember.role,
    createdAt: apiMember.created_at,
    userName: userName,
    userEmail: apiMember.user.email?.trim() || undefined
  };
}

export async function getStudyMembers(studyId: number): Promise<StudyMember[]> {
  const apiMembers = await getJson<StudyMemberApiResponse[]>(`/api/v1/studies/${studyId}/members`);
  return apiMembers.map(transformStudyMember);
}

export interface AddStudyMemberPayload {
  userId: number;
  role: StudyMemberRole;
}

/**
 * Adds a user to a study.
 * POST /api/v1/studies/{study_id}/members/{user_id}
 * Role is sent in the request body.
 */
export async function addStudyMember(
  studyId: number,
  payload: AddStudyMemberPayload
): Promise<StudyMember> {
  // Convert to backend format (snake_case)
  const requestBody = {
    role: payload.role,
  };
  
  const apiMember = await postJson<typeof requestBody, StudyMemberApiResponse>(
    `/api/v1/studies/${studyId}/members/${payload.userId}`,
    requestBody
  );
  
  return transformStudyMember(apiMember);
}

export async function deleteStudyMember(
  studyId: number,
  memberId: number
): Promise<void> {
  await deleteJson(`/api/v1/studies/${studyId}/members/${memberId}`);
}

/**
 * Get current user's role in a study.
 * Returns the role if the user is a member, or null if not found.
 */
export async function getCurrentUserRole(
  studyId: number
): Promise<StudyMemberRole | null> {
  try {
    const apiMember = await getJson<StudyMemberApiResponse>(`/api/v1/studies/${studyId}/members/me`);
    const member = transformStudyMember(apiMember);
    return member.role;
  } catch (error) {
    // If endpoint doesn't exist or user is not a member, return null
    return null;
  }
}

