/**
 * RAG (Retrieval-Augmented Generation) diagnostics types.
 * Types for RAG chunk data and study chunks responses.
 */

export interface RagChunk {
  id: number;
  study_id: number;
  source_document_id?: number | null;
  source_type: string;
  order_index: number;
  text: string;
  created_at: string;
}

export interface RagStudyChunksResponse {
  study_id: number;
  source_type?: string | null;
  total_chunks: number;
  limit: number;
  offset: number;
  chunks: RagChunk[];
}

