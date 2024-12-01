export function chunkDocument(content: string, maxChunkSize: number = 1000): string[] {
  const paragraphs = content.split('\n\n');
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length <= maxChunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = paragraph;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk);
  return chunks;
} 