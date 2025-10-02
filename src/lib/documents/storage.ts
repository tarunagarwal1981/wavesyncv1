import { createClient } from '@/lib/supabase/server';
import { generateSecureFileName } from './utils';
import { DocumentUpload } from './types';

export class DocumentStorageService {
  private bucketName = 'documents';

  /**
   * Upload a single document to Supabase Storage
   */
  async uploadDocument(
    file: File, 
    uploadData: DocumentUpload
  ): Promise<{ url: string; fileName: string }> {
    const supabase = await createClient();
    
    // Generate secure filename
    const fileName = generateSecureFileName(file.name, uploadData.userId);
    const folder = uploadData.folder ? `${uploadData.folder}/` : '';
    const fullPath = `${folder}${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(fullPath);

    return {
      url: publicUrl,
      fileName: data.path
    };
  }

  /**
   * Upload multiple documents to Supabase Storage
   */
  async uploadMultipleDocuments(
    files: File[],
    uploadData: Omit<DocumentUpload, 'file'>
  ): Promise<Array<{ url: string; fileName: string } | { error: string }>> {
    const promises = files.map(async (file) => {
      try {
        const uploadDataWithFile: DocumentUpload = {
          ...uploadData,
          file
        };
        return await this.uploadDocument(file, uploadDataWithFile);
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Upload failed'
        };
      }
    });

    return Promise.all(promises);
  }

  /**
   * Delete document from Supabase Storage
   */
  async deleteDocument(filePath: string): Promise<void> {
    const supabase = await createClient();
    
    const { error } = await supabase.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Generate signed URL for secure download
   */
  async generateSignedUrl(
    filePath: string, 
    expiresIn: number = 3600
  ): Promise<string> {
    const supabase = await createClient();
    
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Download document as blob
   */
  async downloadDocumentAsBlob(filePath: string): Promise<Blob> {
    const supabase = await createClient();
    
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .download(filePath);

    if (error) {
      throw new Error(`Download failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data received');
    }

    return data;
  }

  /**
   * Get document metadata
   */
  async getDocumentMetadata(filePath: string): Promise<{
    size: number;
    lastModified: string;
    contentType?: string;
  }> {
    const supabase = await createClient();
    
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .list(filePath.split('/').slice(0, -1).join('/'), {
        search: filePath.split('/').pop()
      });

    if (error) {
      throw new Error(`Failed to get metadata: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('Document not found');
    }

    return {
      size: data[0].metadata?.size || 0,
      lastModified: data[0].created_at,
      contentType: data[0].metadata?.mimetype
    };
  }

  /**
   * Create a folder in storage
   */
  async createFolder(folderPath: string): Promise<void> {
    const supabase = await createClient();
    
    // Create folder by uploading an empty file
    const { error } = await supabase.storage
      .from(this.bucketName)
      .upload(`${folderPath}/.keep`, new Blob(), {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Folder creation failed: ${error.message}`);
    }
  }

  /**
   * List documents in a folder
   */
  async listDocuments(folderPath?: string): Promise<Array<{
    name: string;
    id: string;
    lastModified: string;
    size: number;
  }>> {
    const supabase = await createClient();
    
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .list(folderPath);

    if (error) {
      throw new Error(`List failed: ${error.message}`);
    }

    return data.map(item => ({
      name: item.name,
      id: item.name,
      lastModified: item.created_at,
      size: item.metadata?.size || 0
    }));
  }

  /**
   * Copy document to new location
   */
  async copyDocument(
    sourcePath: string, 
    destinationPath: string
  ): Promise<void> {
    const supabase = await createClient();
    
    // Download source
    const blob = await this.downloadDocumentAsBlob(sourcePath);
    
    // Upload to new location
    const { error } = await supabase.storage
      .from(this.bucketName)
      .upload(destinationPath, blob, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Copy failed: ${error.message}`);
    }
  }

  /**
   * Move document to new location
   */
  async moveDocument(
    sourcePath: string, 
    destinationPath: string
  ): Promise<void> {
    // Copy to new location
    await this.copyDocument(sourcePath, destinationPath);
    
    // Delete original
    await this.deleteDocument(sourcePath);
  }

  /**
   * Initialize bucket if it doesn't exist
   */
  async initializeBucket(): Promise<void> {
    const supabase = await createClient();
    
    const { data, error } = await supabase.storage.getBucket(this.bucketName);
    
    if (error && error.message.includes('does not exist')) {
      const { error: createError } = await supabase.storage.createBucket(
        this.bucketName,
        {
          public: false,
          allowedMimeTypes: [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
          ],
          fileSizeLimit: 10485760 // 10MB
        }
      );

      if (createError) {
        throw new Error(`Failed to create bucket: ${createError.message}`);
      }
    }
  }
}
