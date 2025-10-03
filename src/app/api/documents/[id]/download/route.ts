import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DocumentStorageService } from '@/lib/documents/storage';

interface DownloadRouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest, 
  { params }: DownloadRouteParams
) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    // Check authentication (either authenticated user or valid token)
    let userId: string | null = null;
    let documentId = params.id;

    if (token) {
      // Token-based access for shared documents
      const { data: share, error: shareError } = await supabase
        .from('document_shares')
        .select('document_id, expires_at, max_downloads, download_count')
        .eq('share_token', token)
        .single();

      if (shareError || !share) {
        return NextResponse.json({ error: 'Invalid share token' }, { status: 401 });
      }

      // Check if share is expired
      if (new Date(share.expires_at) < new Date()) {
        return NextResponse.json({ error: 'Share link has expired' }, { status: 410 });
      }

      // Check download limits
      if (share.max_downloads && share.download_count >= share.max_downloads) {
        return NextResponse.json({ error: 'Download limit exceeded' }, { status: 429 });
      }

      documentId = share.document_id;
      
      // Update download count
      await supabase
        .from('document_shares')
        .update({ download_count: share.download_count + 1 })
        .eq('share_token', token);
    } else {
      // Authenticated user access
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      userId = user.id;
    }

    // Get document details
    let documentQuery = supabase
      .from('documents')
      .select('*')
      .eq('id', documentId);

    if (userId) {
      documentQuery = documentQuery.eq('user_id', userId);
    }

    const { data: document, error: docError } = await documentQuery.single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Generate download URL
    const storageService = new DocumentStorageService();
    let downloadUrl: string;

    if (token) {
      // For shared documents, generate a signed URL
      downloadUrl = await storageService.generateSignedUrl(document.document_url, 3600);
    } else {
      // For authenticated users, use direct download
      downloadUrl = document.document_url;
    }

    // Track download analytics
    try {
      await supabase
        .from('document_downloads')
        .insert({
          document_id: document.id,
          downloaded_by: userId,
          downloaded_at: new Date().toISOString(),
          user_agent: request.headers.get('user-agent') || '',
          ip_address: request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
        });
    } catch (analyticsError) {
      // Don't fail the download if analytics fail
      console.error('Analytics tracking failed:', analyticsError);
    }

    // Return redirect to the file URL
    return NextResponse.redirect(downloadUrl);

  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Optional: Support HEAD requests for file metadata
export async function HEAD(
  request: NextRequest, 
  { params }: DownloadRouteParams
) {
  try {
    const supabase = await createClient();
    
    // Get document metadata
    const { data: document, error } = await supabase
      .from('documents')
      .select('document_name, size, mime_type, created_at')
      .eq('id', params.id)
      .single();

    if (error || !document) {
      return new NextResponse(null, { status: 404 });
    }

    // Return headers with file metadata
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': document.mime_type || 'application/octet-stream',
        'Content-Length': document.size?.toString() || '0',
        'Content-Disposition': `attachment; filename="${document.document_name}"`,
        'Last-Modified': new Date(document.created_at).toUTCString(),
        'ETag': `"${params.id}"`
      }
    });

  } catch (error) {
    console.error('HEAD request error:', error);
    return new NextResponse(null, { status: 500 });
  }
}



