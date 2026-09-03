import { supabase } from './supabaseClient.js';

const BUCKET_NAME = 'cms-media';

/**
 * Upload file to Supabase Storage
 * @param {File} file - File to upload
 * @param {string} folder - Folder path (e.g., 'images', 'videos')
 * @returns {Promise<string>} Public URL of uploaded file
 */
export async function uploadFile(file, folder = 'uploads') {
  if (!file) throw new Error('No file provided');

  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const filename = `${timestamp}-${random}-${file.name}`;
  const filepath = `${folder}/${filename}`;

  // Upload to storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filepath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filepath);

  return urlData.publicUrl;
}

/**
 * Upload image file with validation
 */
export async function uploadImage(file, folder = 'images') {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid image type. Allowed: JPEG, PNG, WebP, SVG');
  }

  if (file.size > maxSize) {
    throw new Error('Image too large. Maximum size: 5MB');
  }

  return uploadFile(file, folder);
}

/**
 * Upload video with validation
 */
export async function uploadVideo(file, folder = 'videos') {
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  const maxSize = 100 * 1024 * 1024; // 100MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid video type. Allowed: MP4, WebM, MOV');
  }

  if (file.size > maxSize) {
    throw new Error('Video too large. Maximum size: 100MB');
  }

  return uploadFile(file, folder);
}

/**
 * Delete file from storage
 */
export async function deleteFile(filepath) {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filepath]);

  if (error) throw new Error(`Delete failed: ${error.message}`);
}

/**
 * List files in folder
 */
export async function listFiles(folder = 'uploads', limit = 50) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(folder, {
      limit,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (error) throw new Error(`List failed: ${error.message}`);
  return data || [];
}

/**
 * Get file metadata
 */
export async function getFileInfo(filepath) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .info(filepath);

  if (error) throw new Error(`Get info failed: ${error.message}`);
  return data;
}

/**
 * Generate signed URL (private files)
 */
export async function getSignedUrl(filepath, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filepath, expiresIn);

  if (error) throw new Error(`Signed URL failed: ${error.message}`);
  return data.signedUrl;
}
