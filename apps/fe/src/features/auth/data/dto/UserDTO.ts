/**
 * User DTO - Data Transfer Object from API
 */

export interface UserDTO {
  id: string;
  email: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  role?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * User Profile DTO from API
 */
export interface UserProfileDTO {
  display_name: string;
  username: string;
  avatar_url?: string | null;
}
