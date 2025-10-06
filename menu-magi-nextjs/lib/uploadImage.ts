import { createClient } from '@/lib/supabase/client';

/**
 * Upload and compress image to Supabase Storage
 * Returns public CDN URL
 */
export async function uploadImage(
  file: File,
  ownerId: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = createClient();

    // Compress image before upload (reduces size by 80%)
    const compressed = await compressImage(file);

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${ownerId}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(fileName, compressed, {
        cacheControl: '3600',
        upsert: false,
        contentType: `image/${fileExt}`,
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: null, error: error.message };
    }

    // Get public URL (CDN-backed)
    const {
      data: { publicUrl },
    } = supabase.storage.from('menu-images').getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Upload failed:', error);
    return { url: null, error: 'Failed to upload image' };
  }
}

/**
 * Compress image to max 800x600, 85% quality
 * Reduces file size by 70-90%
 */
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;

        let width = img.width;
        let height = img.height;

        // Calculate new dimensions (maintain aspect ratio)
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context failed'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/jpeg',
          0.85
        ); // 85% quality
      };
      img.onerror = () => reject(new Error('Image load failed'));
    };
    reader.onerror = () => reject(new Error('File read failed'));
  });
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    const supabase = createClient();

    // Extract file path from URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/menu-images/owner_id/123.jpg
    const urlParts = imageUrl.split('/menu-images/');
    if (urlParts.length < 2) {
      console.error('Invalid image URL');
      return false;
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('menu-images')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete failed:', error);
    return false;
  }
}
