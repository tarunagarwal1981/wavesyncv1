-- Migration: Documents Storage System
-- Description: Creates tables and RLS policies for document management
-- Created: 2024-12-01
-- Version: 1.0

-- Create documents table
create table public.documents (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    document_type document_type_v2 not null default 'other',
    document_name varchar(255) not null,
    upload_date date not null,
    document_url text not null, -- Storage URL
    tags text[] default '{}',
    is_archived boolean default false,
    size bigint, -- File size in bytes
    mime_type varchar(100),
    description text,
    folder varchar(100), -- Custom folder path
    folder_type document_folder_type default 'personal_documents',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create document types enum
create type document_type_v2 as enum (
    'certificate', 
    'contract', 
    'medical', 
    'passport', 
    'other'
);

-- Create document folder types enum
create type document_folder_type as enum (
    'personal_documents',
    'contracts',
    'pay_slips',
    'training_certificates',
    'medical_records',
    'travel_documents',
    'correspondence'
);

-- Create document shares table for secure sharing
create table public.document_shares (
    id uuid primary key default uuid_generate_v4(),
    document_id uuid not null references public.documents(id) on delete cascade,
    share_token varchar(100) unique not null,
    expires_at timestamptz not null,
    max_downloads integer,
    download_count integer default 0,
    created_by uuid not null references auth.users(id),
    created_at timestamptz default now(),
    accessed_at timestamptz
);

-- Create document downloads analytics table
create table public.document_downloads (
    id uuid primary key default uuid_generate_v4(),
    document_id uuid not null references public.documents(id) on delete cascade,
    downloaded_by uuid references auth.users(id) on delete set null,
    downloaded_at timestamptz default now(),
    user_agent text,
    ip_address varchar(45),
    share_token varchar(100)
);

-- Create indexes for performance
create index idx_documents_user_id on public.documents(user_id);
create index idx_documents_folder_type on public.documents(folder_type);
create index idx_documents_tags on public.documents using gin(tags);
create index idx_documents_created_at on public.documents(created_at desc);
create index idx_documents_is_archived on public.documents(is_archived);

create index idx_document_shares_token on public.document_shares(share_token);
create index idx_document_shares_document_id on public.document_shares(document_id);
create index idx_document_shares_expires_at on public.document_shares(expires_at);

create index idx_document_downloads_document_id on public.document_downloads(document_id);
create index idx_document_downloads_downloaded_at on public.document_downloads(downloaded_at desc);

-- RLS Policies
alter table public.documents enable row level security;
alter table public.document_shares enable row level security;
alter table public.document_downloads enable row level security;

-- Documents policies
create policy "Users can view their own documents" on public.documents
    for select using (auth.uid() = user_id);

create policy "Users can insert their own documents" on public.documents
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own documents" on public.documents
    for update using (auth.uid() = user_id);

-- Users can delete their own documents
create policy "Users can delete their own documents" on public.documents
    for delete using (auth.uid() = user_id);

-- Document shares policies
create policy "Users can create shares for their documents" on public.document_shares
    for insert with check (auth.uid() = created_by);

create policy "Users can view their own shares" on public.document_shares
    for select using (auth.uid() = created_by);

create policy "Users can update their own shares" on public.document_shares
    for update using (auth.uid() = created_by);

create policy "Anyone can read valid shares" on public.document_shares
    for select using (true);

-- Document downloads policies
create policy "Users can view their own download history" on public.document_downloads
    for select using (auth.uid() = downloaded_by);

-- Function to clean up expired document shares
create or replace function cleanup_expired_document_shares()
returns void
language sql
security definer
as $$
    delete from public.document_shares 
    where expires_at < now();
$$;

-- Function to track document download
create or replace function track_document_download(
    p_document_id uuid,
    p_user_id uuid default auth.uid(),
    p_share_token varchar default null
)
returns void
language sql
security definer
as $$
    insert into public.document_downloads (
        document_id, 
        downloaded_by, 
        downloaded_at
    ) values (
        p_document_id, 
        p_user_id, 
        now()
    );
$$;

-- Function to get document statistics for a user
create or replace function get_user_document_stats()
returns table (
    total_documents bigint,
    total_size bigint,
    documents_by_type jsonb,
    documents_by_folder jsonb,
    recent_uploads jsonb,
    archived_documents bigint
)
language sql
security definer
as $$
    with doc_stats as (
        select 
            count(*) as total_docs,
            coalesce(sum(size), 0) as total_size,
            count(*) filter (where is_archived) as archived_count
        from public.documents 
        where user_id = auth.uid()
    ),
    type_stats as (
        select 
            jsonb_object_agg(document_type, count) as type_counts
        from (
            select document_type, count(*) as count
            from public.documents 
            where user_id = auth.uid() and not is_archived
            group by document_type
        ) t
    ),
    folder_stats as (
        select 
            jsonb_object_agg(folder_type, count) as folder_counts
        from (
            select folder_type, count(*) as count
            from public.documents 
            where user_id = auth.uid() and not is_archived
            group by folder_type
        ) f
    ),
    recent_stats as (
        select count(*) as recent_count
        from public.documents 
        where user_id = auth.uid() 
        and not is_archived
        and created_at > now() - interval '30 days'
    )
    select 
        ds.total_docs::bigint as total_documents,
        ds.total_size::bigint as total_size,
        coalesce(ts.type_counts, '{}'::jsonb) as documents_by_type,
        coalesce(fs.folder_counts, '{}'::jsonb) as documents_by_folder,
        rs.recent_count::bigint as recent_uploads,
        ds.archived_count::bigint as archived_documents
    from doc_stats ds
    cross join type_stats ts
    cross join folder_stats fs
    cross join recent_stats rs;
$$;

-- Grant necessary permissions
grant select, insert, update, delete on public.documents to authenticated;
grant select, insert, update on public.document_shares to authenticated;
grant select, insert on public.document_downloads to authenticated;

-- Sample documents for testing (optional)
-- Note: Replace '00000000-0000-0000-0000-000000000000' with actual user IDs
/*
insert into public.documents (
    user_id, 
    document_name, 
    document_type, 
    upload_date, 
    document_url, 
    tags, 
    folder_type
) values 
(
    '00000000-0000-0000-0000-000000000000',
    'Employment Contract.pdf',
    'contract',
    '2024-01-15',
    '/sample/contract.pdf',
    array['employment', 'contract'],
    'contracts'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Medical Certificate.jpg',
    'medical',
    '2024-01-20',
    '/sample/medical.jpg',
    array['medical', 'health'],
    'medical_records'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Training Records.docx',
    'document',
    '2024-02-01',
    '/sample/training.docx',
    array['training', 'education'],
    'training_certificates'
);
*/
