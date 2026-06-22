import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import { generateEmbedding } from './embeddings.js';

const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

function chunkText(text) {
  const words = text.split(/\s+/);
  const chunks = [];
  let i = 0;
  while (i < words.length) {
    const chunk = words.slice(i, i + CHUNK_SIZE).join(' ');
    if (chunk.trim()) chunks.push(chunk);
    i += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

export async function ingestFile(filePath, onProgress) {
  const fileName = path.basename(filePath);

  const { data: doc, error: docError } = await supabase
    .from('documents')
    .insert({ filename: fileName, file_type: 'pdf', status: 'processing' })
    .select()
    .single();
  if (docError) throw docError;

  try {
    const buffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(buffer);
    const text = parsed.text.replace(/\s+/g, ' ').trim();
    const chunks = chunkText(text);

    const rows = [];
    for (let i = 0; i < chunks.length; i++) {
      onProgress?.(`Embedding chunk ${i + 1}/${chunks.length}`);
      const embedding = await generateEmbedding(chunks[i]);
      rows.push({
        document_id: doc.id,
        content: chunks[i],
        embedding: `[${embedding.join(',')}]`,
        chunk_index: i,
      });
    }

    const BATCH = 50;
    for (let i = 0; i < rows.length; i += BATCH) {
      const { error } = await supabase.from('document_chunks').insert(rows.slice(i, i + BATCH));
      if (error) throw error;
    }

    await supabase.from('documents').update({ status: 'active' }).eq('id', doc.id);
    return { filename: fileName, chunks: chunks.length, id: doc.id };
  } catch (err) {
    await supabase.from('documents').update({ status: 'error' }).eq('id', doc.id);
    throw err;
  }
}

export async function deleteFileFromIndex(documentId) {
  const { error } = await supabase.from('documents').delete().eq('id', documentId);
  if (error) throw error;
}
