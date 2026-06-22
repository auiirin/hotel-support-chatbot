-- Run this in Supabase SQL Editor before starting the app

-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. Documents table
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  file_type text not null default 'pdf',
  uploaded_at timestamptz not null default now(),
  status text not null default 'active'
);

-- 3. Document chunks + embeddings
create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  chunk_index int not null,
  created_at timestamptz not null default now()
);

-- 4. Index for fast similarity search
create index if not exists document_chunks_embedding_idx
  on document_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 5. Similarity search function
create or replace function search_chunks(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  filename text,
  chunk_index int,
  similarity float
)
language sql stable
as $$
  select
    dc.id,
    dc.content,
    d.filename,
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  join documents d on d.id = dc.document_id
  where d.status = 'active'
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;
