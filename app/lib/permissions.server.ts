// app/lib/permissions.server.ts
import { Role, TeamMember } from "@prisma/client";

/**
 * Check if a team member is the owner.
 */
export function isOwner(member: Pick<TeamMember, "role">): boolean {
  return member.role === Role.OWNER;
}

/**
 * Check if a team member is an admin or owner.
 */
export function isAdminOrOwner(member: Pick<TeamMember, "role">): boolean {
  return member.role === Role.OWNER || member.role === Role.ADMIN;
}

/**
 * Check if a user can manage team settings (invite, remove, change role).
 */
export function canManageTeam(userId: string, members: TeamMember[]): boolean {
  return members.some(
    (member) =>
      member.userId === userId &&
      (member.role === Role.OWNER || member.role === Role.ADMIN),
  );
}

/**
 * Check if a user is a team member (excluding pending).
 */
export function isActiveMember(userId: string, members: TeamMember[]): boolean {
  return members.some(
    (member) => member.userId === userId && member.role !== Role.PENDING,
  );
}

/**
 * Check if a user is already in the team in any role (including pending).
 */
export function isInTeam(userId: string, members: TeamMember[]): boolean {
  return members.some((member) => member.userId === userId);
}
