'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { 
  Document, 
  DocumentFilters, 
  DocumentStats,
  DocumentUpload,
  SecureShare,
  DocumentVersion,
  Folder 
} from './types';

/**
 * Get all documents for the current user
 */
export async function getDocuments(filters: DocumentFilters = {}): Promise<Document[]> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('upload_date', { ascending: false });

  // Apply filters
  if (filters.documentType) {
    query = query.eq('document_type', filters.documentType);
  }

  if (filters.folderType) {
    query = query.eq('folder_type', filters.folderType);
  }

  if (filters.search) {
    query = query.or(`document_name.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
  }

  if (filters.uploadDateFrom) {
    query = query.gte('upload_date', filters.uploadDateFrom);
  }

  if (filters.uploadDateTo) {
    query = query.lte('upload_date', filters.uploadDateTo);
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }

  // Apply sorting
  if (filters.sortBy) {
    const ascending = filters.sortOrder === 'asc';
    query = query.order(filters.sortBy, { ascending });
  }

  const { data: documents, error } = await query;

  if (error) {
    throw new Error('Failed to fetch documents');
  }

  return documents || [];
}

/**
 * Get a single document by ID
 */
export async function getDocumentById(id: string): Promise<Document | null> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Document not found
    }
    throw new Error('Failed to fetch document');
  } 

  return document;
}

/**
 * Create a new document
 */
export async function createDocument(documentData: Omit<Document, 'id' | 'createdAt'>): Promise<Document> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { data: document, error } = await supabase
    .from('documents')
    .insert({
      ...documentData,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create document');
  }

  revalidatePath('/documents');
  return document;
}

/**
 * Update document metadata
 */
export async function updateDocument(
  id: string, 
  updates: Partial<Pick<Document, 'documentName' | 'documentType' | 'tags' | 'description' | 'folder'>>
): Promise<Document> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { data: document, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update document');
  }

  revalidatePath('/documents');
  revalidatePath(`/documents/${id}`);
  return document;
}

/**
 * Delete document
 */
export async function deleteDocument(id: string): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // First get the document to extract file path for storage deletion
  const { data: document } = await supabase
    .from('documents')
    .select('document_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  // Delete from database
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (dbError) {
    throw new Error('Failed to delete document');
  }

  // Note: Storage cleanup would be handled separately
  // in production, you might want to implement a cleanup job

  revalidatePath('/documents');
}

/**
 * Archive document
 */
export async function archiveDocument(id: string): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('documents')
    .update({ is_archived: true })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error('Failed to archive document');
  }

  revalidatePath('/documents');
}

/**
 * Get document statistics
 */
export async function getDocumentStats(): Promise<DocumentStats> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Get main stats
  const { data: documents } = await supabase
    .from('documents')
    .select('document_type, folder_type, size, upload_date, is_archived')
    .eq('user_id', user.id);

  if (!documents) {
    return {
      totalDocuments: 0,
      totalSize: 0,
      documentsByType: {} as any,
      documentsByFolder: {} as any,
      recentUploads: [],
      archivedDocuments: 0
    };
  }

  const totalDocuments = documents.length;
  const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
  const archivedDocuments = documents.filter(doc => doc.is_archived).length;

  // Count by type
  const documentsByType = documents.reduce((acc, doc) => {
    acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count by folder
  const documentsByFolder = documents.reduce((acc, doc) => {
    const folderType = doc.folder_type || 'uncategorized';
    acc[folderType] = (acc[folderType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Recent uploads
  const recentUploads = documents
    .filter(doc => !doc.is_archived)
    .sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime())
    .slice(0, 5)
    .map(doc => ({
      id: doc.id,
      userId: user.id,
      documentType: doc.document_type,
      documentName: doc.document_name,
      uploadDate: doc.upload_date,
      documentUrl: doc.document_url,
      tags: doc.tags || [],
      isArchived: doc.is_archived,
      size: doc.size,
      createdAt: doc.created_at
    }));

  return {
    totalDocuments,
    totalSize,
    documentsByType,
    documentsByFolder,
    recentUploads,
    archivedDocuments
  };
}

/**
 * Get folders for the current user
 */
export async function getFolders(): Promise<Folder[]> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Get folder counts by joining with documents
  const { data: folders } = await supabase
    .from('documents')
    .select('folder_type')
    .eq('user_id', user.id)
    .eq('is_archived', false);

  if (!folders) {
    return [];
  }

  // Count documents per folder type
  const folderCounts = folders.reduce((acc, doc) => {
    const folderType = doc.folder_type || 'uncategorized';
    acc[folderType] = (acc[folderType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convert to folder objects
  const folderList: Folder[] = Object.entries(folderCounts).map(([folderType, count]) => ({
    id: folderType,
    name: folderType.replace('_', ' '), // Convert snake_case to readable format
    type: folderType as any,
    userId: user.id,
    documentCount: count,
    createdAt: new Date().toISOString()
  }));

  return folderList;
}

/**
 * Create secure share link for document
 */
export async function createSecureShare(
  documentId: string,
  expiresAt: string,
  maxDownloads?: number
): Promise<SecureShare> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Verify document ownership
  const { data: document } = await supabase
    .from('documents')
    .select('id')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single();

  if (!document) {
    throw new Error('Document not found');
  }

  // Generate random token
  const shareToken = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64')
    .replace(/[/+=]/g, '');

  const { data: share, error } = await supabase
    .from('document_shares')
    .insert({
      document_id: documentId,
      share_token: shareToken,
      expires_at: expiresAt,
      max_downloads: maxDownloads,
      created_by: user.id
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create share link');
  }

  return share;
}

/**
 * Get document by share token for downloads
 */
export async function getDocumentByShareToken(token: string): Promise<Document | null> {
  const supabase = await createClient();
  
  const { data: share, error: shareError } = await supabase
    .from('document_shares')
    .select('document_id, expires_at, max_downloads, download_count')
    .eq('share_token', token)
    .single();

  if (shareError || !share) {
    return null;
  }

  // Check if share is expired
  if (new Date(share.expires_at) < new Date()) {
    return null;
  }

  // Check download limits
  if (share.max_downloads && share.download_count >= share.max_downloads) {
    return null;
  }

  // Get the actual document
  const { data: document } = await supabase
    .from('documents')
    .select('*')
    .eq('id', share.document_id)
    .single();

  return document;
}
