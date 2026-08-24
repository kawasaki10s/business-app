import { getServerSession } from 'next-auth';
import { Role } from '@prisma/client';
import { authOptions } from '@/lib/auth';

// ============================================================
// SERVER-SIDE AUTHORIZATION
// ------------------------------------------------------------
// This is the ONLY place permission decisions are made.
// UI hides buttons for convenience, but every API route / server
// action MUST call one of these functions before doing anything.
// Hiding a button on the frontend is never sufficient by itself.
// ============================================================

export class UnauthorizedError extends Error {
  constructor(message = 'Ruxsat berilmagan amal') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class UnauthenticatedError extends Error {
  constructor(message = 'Tizimga kirish talab qilinadi') {
    super(message);
    this.name = 'UnauthenticatedError';
  }
}

export type SessionUser = {
  id: string;
  role: Role;
  name?: string | null;
  email?: string | null;
};

/** Returns the current session's user, or throws if not authenticated. */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new UnauthenticatedError();
  }
  return session.user as SessionUser;
}

/** Requires the current user to have the ADMIN role. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== Role.ADMIN) {
    throw new UnauthorizedError('Bu amal faqat admin uchun');
  }
  return user;
}

/** Any authenticated user (admin or investor) may proceed - used for shared read endpoints. */
export async function requireAnyRole(): Promise<SessionUser> {
  return requireAuth();
}

// ------------------------------------------------------------
// PERMISSION MATRIX (mirrors the approved design doc)
// Each entry: can the given role perform the action.
// ------------------------------------------------------------

export const PERMISSIONS = {
  VIEW_ALL_INVESTORS: { ADMIN: true, INVESTOR: true },
  EDIT_BUSINESS_VALUE: { ADMIN: true, INVESTOR: false },
  CREATE_OWN_LOAN: { ADMIN: true, INVESTOR: true },
  CREATE_LOAN_FOR_OTHERS: { ADMIN: true, INVESTOR: false },
  SPEND_OWN_BALANCE: { ADMIN: true, INVESTOR: true },
  EDIT_DELETE_TRANSACTION: { ADMIN: true, INVESTOR: false },
  VIEW_GLOBAL_HISTORY: { ADMIN: true, INVESTOR: true },
  VIEW_AUDIT_LOG: { ADMIN: true, INVESTOR: false },
  MANAGE_USERS: { ADMIN: true, INVESTOR: false },
  MANAGE_OWN_CARDS: { ADMIN: true, INVESTOR: true },
  MANAGE_OTHERS_CARDS: { ADMIN: true, INVESTOR: false },
  SEND_NOTIFICATION: { ADMIN: true, INVESTOR: false },
  EXPORT_REPORTS: { ADMIN: true, INVESTOR: false },
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, permission: PermissionKey): boolean {
  return PERMISSIONS[permission][role];
}

/** Throws UnauthorizedError if the current session user lacks the permission. */
export async function requirePermission(permission: PermissionKey): Promise<SessionUser> {
  const user = await requireAuth();
  if (!hasPermission(user.role, permission)) {
    throw new UnauthorizedError(`Ruxsat yo'q: ${permission}`);
  }
  return user;
}

/** A user may always act on their own resource, OR an admin may act on anyone's. */
export function canActOnUser(actor: SessionUser, targetUserId: string): boolean {
  return actor.role === Role.ADMIN || actor.id === targetUserId;
}
