/**
 * Auth Repository Interface - Domain Layer
 * 
 * Defines the contract for authentication operations.
 * Implementation is in the data layer.
 */

import { User, UserProfile, AuthSession } from '../entities/User';
import { Result } from '@/shared/types';

export interface IAuthRepository {
  /**
   * Get current session if user is authenticated
   */
  getSession(): Promise<AuthSession | null>;

  /**
   * Get current user's profile from the API
   */
  getCurrentUserProfile(accessToken: string): Promise<Result<UserProfile>>;

  /**
   * Sign out the current user
   */
  signOut(): Promise<void>;

  /**
   * Subscribe to auth state changes
   * Returns an unsubscribe function
   */
  onAuthStateChange(
    callback: (session: AuthSession | null) => void
  ): () => void;
}
