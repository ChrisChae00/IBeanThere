import { createClient } from './client';

const AVATAR_BUCKET = 'avatars';
const CAFE_IMAGES_BUCKET = 'cafe-images';

/**
 * Upload avatar image to Supabase Storage
 * @param userId - User's UUID
 * @param file - Image file to upload
 * @returns Public URL of the uploaded avatar
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const supabase = createClient();
  
  // Generate unique filename with timestamp to avoid cache issues
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `avatar_${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;
  
  // Delete existing avatars first (clean up old files)
  await deleteExistingAvatars(userId);
  
  // Upload new avatar
  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });
  
  if (error) {
    console.error('Avatar upload error:', error);
    throw new Error(`Failed to upload avatar: ${error.message}`);
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(data.path);
  
  return urlData.publicUrl;
}

/**
 * Delete existing avatars for a user
 * @param userId - User's UUID
 */
async function deleteExistingAvatars(userId: string): Promise<void> {
  const supabase = createClient();
  
  try {
    // List all files in user's folder
    const { data: files, error: listError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .list(userId);
    
    if (listError || !files || files.length === 0) {
      return;
    }
    
    // Delete all existing files
    const filesToDelete = files.map((file: { name: string }) => `${userId}/${file.name}`);
    await supabase.storage
      .from(AVATAR_BUCKET)
      .remove(filesToDelete);
  } catch (error) {
    // Non-blocking: log but don't throw
    console.warn('Failed to delete existing avatars:', error);
  }
}

/**
 * Get public URL for an avatar
 * @param userId - User's UUID
 * @param filename - Avatar filename
 * @returns Public URL
 */
export function getAvatarPublicUrl(userId: string, filename: string): string {
  const supabase = createClient();
  const { data } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(`${userId}/${filename}`);
  
  return data.publicUrl;
}

/**
 * Upload a cafe image to Supabase Storage
 * @param file - Image file to upload
 * @param userId - User's UUID for organizing storage paths
 * @returns Public URL of the uploaded image
 */
export async function uploadCafeImage(file: File, userId: string): Promise<string> {
  const validation = validateImageFile(file, 5);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const supabase = createClient();
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(CAFE_IMAGES_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    console.error('Cafe image upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(CAFE_IMAGES_BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Validate image file before upload
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB
 * @returns Validation result
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 2
): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please use JPEG, PNG, or WebP.',
    };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSizeMB}MB.`,
    };
  }
  
  return { valid: true };
}
