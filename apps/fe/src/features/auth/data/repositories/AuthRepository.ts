/**
 * Auth Repository Implementation - Data Layer
 * 
 * Implements IAuthRepository using Supabase and API
 */

import { createClient } from '@/shared/lib/supabase/client';
import { IAuthRepository, AuthSession, UserProfile } from '../../domain';
import { UserProfileDTO } from '../dto/UserDTO';
import { Result, success, failure } from '@/shared/types';

export class AuthRepository implements IAuthRepository {
  private supabase = createClient();
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  async getSession(): Promise<AuthSession | null> {
    const { data: { session } } = await this.supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    const metadata = session.user.user_metadata || {};
    
    return {
      user: {
        id: session.user.id,
        email: session.user.email || '',
        username: metadata.username || '',
        displayName: metadata.display_name || metadata.username || '',
        bio: metadata.bio,
        avatarUrl: metadata.avatar_url,
        role: metadata.role,
        termsAccepted: !!metadata.terms_accepted,
        createdAt: new Date(session.user.created_at),
        updatedAt: session.user.updated_at ? new Date(session.user.updated_at) : undefined,
      },
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : undefined,
    };
  }

  async getCurrentUserProfile(accessToken: string): Promise<Result<UserProfile>> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return failure(new Error(`Failed to fetch profile: ${response.status}`));
      }

      const data: UserProfileDTO = await response.json();
      
      return success({
        display_name: data.display_name || data.username,
        username: data.username,
        avatar_url: data.avatar_url || undefined,
      });
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session?.user) {
          callback(null);
          return;
        }

        const metadata = session.user.user_metadata || {};
        
        callback({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            username: metadata.username || '',
            displayName: metadata.display_name || metadata.username || '',
            bio: metadata.bio,
            avatarUrl: metadata.avatar_url,
            role: metadata.role,
            termsAccepted: !!metadata.terms_accepted,
            createdAt: new Date(session.user.created_at),
            updatedAt: session.user.updated_at ? new Date(session.user.updated_at) : undefined,
          },
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : undefined,
        });
      }
    );

    return () => subscription.unsubscribe();
  }

  /**
   * Send password reset email using Supabase Auth
   */
  async sendPasswordResetEmail(email: string, redirectUrl: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return failure(new Error(error.message));
      }

      return success(undefined);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to send reset email'));
    }
  }

  /**
   * Update the current user's password
   */
  async updatePassword(newPassword: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return failure(new Error(error.message));
      }

      return success(undefined);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to update password'));
    }
  }
}

// Singleton instance
let authRepository: AuthRepository | null = null;

export function getAuthRepository(): AuthRepository {
  if (!authRepository) {
    authRepository = new AuthRepository();
  }
  return authRepository;
}

