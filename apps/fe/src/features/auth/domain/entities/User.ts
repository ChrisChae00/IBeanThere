/**
 * User Entity - Domain Layer
 * 
 * Pure domain representation of a user, independent of API/DB structure.
 */

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  role?: string;
  termsAccepted: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * User Profile - Subset of user data for display purposes
 * Uses snake_case for backward compatibility with existing code
 */
export interface UserProfile {
  display_name: string;
  username: string;
  avatar_url?: string | null;
}

/**
 * Auth Session - Represents an authenticated session
 */
export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

/**
 * Check if user needs profile setup (temporary username or no terms accepted)
 */
export function needsProfileSetup(user: User): boolean {
  const isTempUsername = !user.username || 
    (user.username.startsWith('user_') && user.username.length > 5);
  return isTempUsername || !user.termsAccepted;
}
