import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import { generateEmbedding } from './embeddings.js';

const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

export async function getDocumentList() {
  const { data, error } = await supabase
    .from('documents')
    .select('id, filename, file_type, uploaded_at, status')
    .order('uploaded_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function searchRelevantChunks(query, topK = 5) {
  const embedding = await generateEmbedding(query);

  const { data, error } = await supabase.rpc('search_chunks', {
    query_embedding: `[${embedding.join(',')}]`,
    match_count: topK,
  });
  if (error) throw error;

  return data.map((r) => ({
    content: r.content,
    source: r.filename,
    score: r.similarity,
  }));
}
