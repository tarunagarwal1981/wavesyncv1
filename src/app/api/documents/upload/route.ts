import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DocumentStorageService } from '@/lib/documents/storage';
import { 
  isValidFileType, 
  isValidFileSize, 
  generateSecureFileName,
  suggestTags 
} from '@/lib/documents/utils';
import { 
  DocumentUpload, 
  MAX_FILE_SIZE,
  SUPPORTED_FILE_TYPES 
} from '@/lib/documents/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folderType = formData.get('folderType') as string || 'personal_documents';
    const tags = JSON.parse(formData.get('tags') as string || '[]') as string[];
    const description = formData.get('description') as string;

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Validate files
    for (const file of files) {
      if (!isValidFileType(file)) {
        return NextResponse.json({ 
          error: `File type ${file.type} is not supported` 
        }, { status: 400 });
      }

      if (!isValidFileSize(file)) {
        return NextResponse.json({ 
          error: `File ${file.name} is too large (max ${MAX_FILE_SIZE} bytes)` 
        }, { status: 400 });
      }
    }

    const storageService = new DocumentStorageService();
    const uploads: Array<{
      file: File;
      url: string;
      fileName: string;
      size: number;
      mimeType: string;
    }> = [];

    // Upload files
    for (const file of files) {
      try {
        const uploadData: DocumentUpload = {
          file,
          documentType: file.type === 'application/pdf' ? 'certificate' : 'certificate',
          folder: folderType as any,
          tags: [...suggestTags(file), ...tags],
          description
        };

        const { url, fileName } = await storageService.uploadDocument(file, uploadData);
        
        uploads.push({
          file,
          url,
          fileName,
          size: file.size,
          mimeType: file.type
        });
      } catch (error) {
        console.error('Upload failed for file:', file.name, error);
        return NextResponse.json({ 
          error: `Failed to upload ${file.name}` 
        }, { status: 500 });
      }
    }

    // Create document records in database
    const documentIds: string[] = [];
    for (const upload of uploads) {
      try {
        const tags = [...suggestTags(upload.file), ...JSON.parse(formData.get('tags') as string || '[]')];
        
        const { data: document, error: dbError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            document_type: upload.file.type === 'application/pdf' ? 'certificate' : 'document',
            document_name: upload.file.name,
            upload_date: new Date().toISOString().split('T')[0],
            document_url: upload.url,
            tags,
            is_archived: false,
            size: upload.size,
            mime_type: upload.mimeType,
            description
          })
          .select('id')
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          // Clean up uploaded file
          await storageService.deleteDocument(upload.fileName);
          continue;
        }

        documentIds.push(document.id);
      } catch (error) {
        console.error('Database error:', error);
        // Clean up uploaded file
        await storageService.deleteDocument(upload.fileName);
      }
  }

    return NextResponse.json({
      success: true,
      documentIds,
      uploaded: uploads.length,
      message: `${uploads.length} file${uploads.length !== 1 ? 's' : ''} uploaded successfully`
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
